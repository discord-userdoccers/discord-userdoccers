import { error, summary } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import type { WorkflowRunCompletedEvent } from "@octokit/webhooks-types";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_TOKEN: string;

      CLOUDFLARE_ACCOUNT_ID: string;

      PROJECT_NAME: string;

      DEPLOYMENT_ENVIRONMENT: "production" | "preview";

      DEPLOYMENT_URL: string;
      DEPLOYMENT_ALIAS_URL: string;
      DEPLOYMENT_ID: string;

      DEPLOYMENT_REF: string;
      // Empty string or number
      DEPLOYMENT_PR_NUMBER: string;
      // JSON stringified
      DEPLOYMENT_DESCRIPTION: string;
    }
  }
}

const {
  GITHUB_TOKEN,

  CLOUDFLARE_ACCOUNT_ID,

  PROJECT_NAME,

  DEPLOYMENT_ENVIRONMENT,

  DEPLOYMENT_URL,
  DEPLOYMENT_ALIAS_URL,
  DEPLOYMENT_ID,

  DEPLOYMENT_REF,
  DEPLOYMENT_PR_NUMBER,
  DEPLOYMENT_DESCRIPTION,
} = process.env;

const ENV_CONF = {
  production: {
    environment: "Production",
    production_environment: true,
  },
  preview: {
    environment: "Preview",
    production_environment: false,
  },
};

function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - 3) + "...";
}

async function main() {
  if (!["production", "preview"].includes(DEPLOYMENT_ENVIRONMENT)) {
    error('expected DEPLOYMENT_ENVIRONMENT to be one of ("production", "preview")', {
      title: "Invalid Environment",
    });

    return 1;
  }

  const github = getOctokit(GITHUB_TOKEN);

  const { environment, production_environment } = ENV_CONF[DEPLOYMENT_ENVIRONMENT];

  const description = truncate(JSON.parse(DEPLOYMENT_DESCRIPTION).split("\n")[0], 140);

  const deployment = await github.rest.repos.createDeployment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: DEPLOYMENT_REF,
    environment,
    production_environment,
    description,
    required_contexts: [],
    auto_merge: false,
    payload: DEPLOYMENT_PR_NUMBER ? { pull_request: Number(DEPLOYMENT_PR_NUMBER) } : {},
  });

  if (deployment.status !== 201) {
    error(deployment.data.message ?? "error creating deployment", { title: "Deployment Failed" });

    return 1;
  }

  await github.rest.repos.createDeploymentStatus({
    owner: context.repo.owner,
    repo: context.repo.repo,
    environment,
    production_environment,
    description,
    deployment_id: deployment.data.id,
    environment_url: DEPLOYMENT_URL,
    log_url: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/pages/view/${PROJECT_NAME}/${DEPLOYMENT_ID}`,
    state: "success",
    auto_inactive: false,
  });

  await summary
    .addRaw(
      `# ${environment} Deployment

| Name                           | Result                  |
| ------------------------------ | ----------------------- |
| **Last commit:**               | ${DEPLOYMENT_REF}       |
| **${environment} URL**:        | ${DEPLOYMENT_URL}       |
| **Branch ${environment} URL**: | ${DEPLOYMENT_ALIAS_URL} |`,
    )
    .write();

  return 0;
}

process.exit(await main());
