import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import inquirer from "inquirer";
import isValidDomain from "is-valid-domain";
import { validate as isValidEmail } from "email-validator";

type WebsiteInfo = {
  /**
   * Domain name (can be subdomain)
   */
  domains: Array<string>;

  /**
   * Email address
   */
  emailAddress: string;
};

const getWebsiteInfo = async (): Promise<WebsiteInfo> => {
  const answers = await inquirer.prompt([
    {
      name: "domain",
      message: "Please enter domain name (or subdomain) FQDN: ",
      type: "input",

      validate: (val) =>
        isValidDomain(val, {
          wildcard: false,
          subdomain: true,
          allowUnicode: false,
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

      validate: (val) => isValidEmail(val),
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
    .split("$DOMAIN")
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

const checkObtainCertificate = async ({
  domains,
}: {
  domains: Array<string>;
}) => {
  const domainParams = domains
    .map((domainName) => `-d ${domainName}`)
    .join(" ");

  execSync(
    `docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ --dry-run ${domainParams}`,
    { stdio: "inherit" }
  );
};

(async () => {
  const { domains } = await getWebsiteInfo();

  // obtain certificate for the first time
  await createInitialNginxConfig({ domains });
  await restartNginx();
  await checkObtainCertificate({ domains });
})()
  .then(() => {
    console.info("Done");
  })
  .catch((err) => {
    throw err;
  });
