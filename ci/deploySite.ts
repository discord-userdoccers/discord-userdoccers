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

async function getMetadata(github: ReturnType<typeof getOctokit>) {
  const {
    workflow_run: { event, head_commit, head_sha, pull_requests },
  } = context.payload as WorkflowRunCompletedEvent;

  if (event == "pull_request") {
    const [
      {
        head: { sha },
        number,
      },
    ] = pull_requests;

    const pr = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: number,
    });

    if (pr.status != 200) {
      error(pr.data.message ?? "error fetching PR", { title: "Fetching PR Failed" });

      process.exit(1);
    }

    return {
      ref: sha,
      payload: { pull_request: number },
      description: pr.data.pullRequest.title,
    };
  }

  return {
    ref: head_sha,
    payload: {},
    description: head_commit.message,
  };
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

  const { ref, payload, description } = await getMetadata(github);

  const deployment = await github.rest.repos.createDeployment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref,
    environment,
    production_environment,
    description,
    required_contexts: [],
    auto_merge: false,
    payload,
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
| **Last commit:**               | ${ref}                  |
| **${environment} URL**:        | ${DEPLOYMENT_URL}       |
| **Branch ${environment} URL**: | ${DEPLOYMENT_ALIAS_URL} |`,
    )
    .write();

  return 0;
}

process.exit(await main());
