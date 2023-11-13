import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

import inquirer from "inquirer";
// import isValidDomain from "is-valid-domain";
// import { validate as isValidEmail } from "email-validator";
import isFQDN from "validator/lib/isFQDN.js";
import isEmail from "validator/lib/isEmail.js";
import isURL from "validator/lib/isURL.js";

type WebsiteConfig = {
  /**
   * Domain name (can be subdomain)
   */
  domains: Array<string>;

  /**
   * Email address
   */
  emailAddress: string;
};

const getWebsiteConfig = async (): Promise<WebsiteConfig> => {
  const answers = await inquirer.prompt([
    {
      name: "domain",
      message: "Please enter domain name (or subdomain) FQDN: ",
      type: "input",

      validate: (val) =>
        isFQDN.default(val, {
          allow_trailing_dot: false,
          allow_underscores: false,
          allow_wildcard: true,
        }),
    },
    {
      name: "addWWW",
      message: "Add www to the domain? ",
      type: "confirm",

      default: true,
    },
    {
      name: "email",
      message: "Please enter your email address: ",
      type: "input",

      validate: (val) => isEmail.default(val),
    },
  ]);

  const domains = [answers["domain"]];

  if (answers["addWWW"] === true) {
    domains.push(`www.${domains[0]}`);
  }

  return {
    domains,
    emailAddress: answers["email"],
  };
};

const createInitialNginxConfig = async ({
  domains,
}: {
  domains: Array<string>;
}) => {
  // read template
  const nginxConfigTemplate = fs.readFileSync(
    path.join(process.cwd(), "template", "nginx_website_certbot_init.conf"),
    "utf8"
  );

  // replace variables
  const nginxWebsiteConfig = nginxConfigTemplate
    .split("$SERVER_NAME")
    .join(domains.join(" "));

  // write to disk
  fs.writeFileSync(
    path.join(
      process.cwd(),
      "app",
      "nginx",
      "sites-enabled",
      `${domains[0]}.conf`
    ),
    nginxWebsiteConfig,
    "utf-8"
  );
};

const restartNginx = async () => {
  execSync("docker compose restart nginx", { stdio: "inherit" });
};

const obtainLetsEncryptCertificate = async ({
  domains,
  emailAddress,

  dryRun,
}: {
  domains: Array<string>;
  emailAddress: string;

  dryRun: boolean;
}) => {
  const domainParams = domains
    .map((domainName) => `-d ${domainName}`)
    .join(" ");

  let command = `docker compose run --rm certbot certonly --email ${emailAddress} --agree-tos --no-eff-email --webroot --webroot-path /var/www/certbot/ ${domainParams}`;

  if (dryRun === true) {
    command = [command, "--dry-run"].join(" ");
  }

  execSync(command, { stdio: "inherit" });
};

type ProxyConfig = {
  host: string;
};

const getProxyConfig = async (): Promise<ProxyConfig> => {
  const answers = await inquirer.prompt([
    {
      name: "host",
      message: "Please enter Proxy host (e.g. http://127.0.0.1:3000): ",
      type: "input",

      validate: (val) => isURL.default(val),
    },
  ]);

  return { host: answers["host"] };
};

const createNginxSubdomainRedirectConfig = async ({
  domainName,
  subdomains,
}: {
  domainName: string;
  subdomains: Array<string>;
}) => {
  // read template
  const nginxConfigTemplate = fs.readFileSync(
    path.join(
      process.cwd(),
      "template",
      "nginx_website_subdomain_redirect.conf"
    ),
    "utf8"
  );

  // replace variables
  const nginxSubdomainRedirectConfig = nginxConfigTemplate
    .split("$SERVER_NAME")
    .join(subdomains.join(" "))
    .split("$DOMAIN_NAME")
    .join(domainName);

  return nginxSubdomainRedirectConfig;
};

const createNginxWebsiteConfig = async ({
  websiteConfig,
  proxyConfig,
}: {
  websiteConfig: WebsiteConfig;
  proxyConfig: ProxyConfig;
}) => {
  // read template
  const nginxConfigTemplate = fs.readFileSync(
    path.join(process.cwd(), "template", "nginx_website.conf"),
    "utf8"
  );

  const serverName = websiteConfig.domains.join(" ");
  const domainName = websiteConfig.domains[0];

  // replace variables
  let nginxWebsiteConfig = nginxConfigTemplate
    .split("$SERVER_NAME")
    .join(serverName)
    .split("$DOMAIN_NAME")
    .join(domainName)
    .split("$PROXY_HOST")
    .join(proxyConfig.host);

  if (websiteConfig.domains.length > 1) {
    const subdomains = [...websiteConfig.domains];
    subdomains.shift();

    nginxWebsiteConfig = [
      nginxWebsiteConfig,
      await createNginxSubdomainRedirectConfig({
        domainName,
        subdomains,
      }),
    ].join(`${os.EOL}${os.EOL}`);
  }

  // write to disk
  fs.writeFileSync(
    path.join(
      process.cwd(),
      "app",
      "nginx",
      "sites-enabled",
      `${domainName}.conf`
    ),
    nginxWebsiteConfig,
    "utf-8"
  );
};

(async () => {
  // get initial website configuration
  const websiteConfig = await getWebsiteConfig();

  // obtain certificate for the first time
  const { domains, emailAddress } = websiteConfig;
  await createInitialNginxConfig({ domains });
  await restartNginx();
  await obtainLetsEncryptCertificate({ domains, emailAddress, dryRun: true });
  await obtainLetsEncryptCertificate({ domains, emailAddress, dryRun: false });

  // create final configuration
  const proxyConfig = await getProxyConfig();
  await createNginxWebsiteConfig({ websiteConfig, proxyConfig });

  // restart nginx
  await restartNginx();

  // add crontab
})()
  .then(() => {
    console.info("Done");
  })
  .catch((err) => {
    throw err;
  });
