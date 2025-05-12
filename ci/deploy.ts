import { error, summary } from "@actions/core";
import { context, getOctokit } from "@actions/github";

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
    DEPLOYMENT_DESCRIPTION,
} = process.env;

const envConfig = {
    production: {
        environment: "Production",
        production: true,
        description: DEPLOYMENT_DESCRIPTION,
    },
    preview: {
        environment: "Preview",
        production: false,
        description: DEPLOYMENT_DESCRIPTION,
    },
};

async function main() {
    if (!["push", "pull_request_target"].includes(context.eventName)) {
        error(
            'expected context event to be one of ("push", "pull_request_target")',
            {
                title: "Invalid Event",
            },
        );

        return 1;
    }

    if (!["production", "preview"].includes(DEPLOYMENT_ENVIRONMENT)) {
        error(
            'expected DEPLOYMENT_ENVIRONMENT to be one of ("production", "preview")',
            {
                title: "Invalid Environment",
            },
        );

        return 1;
    }

    const octokit = getOctokit(GITHUB_TOKEN);
    const {
        environment,
        production: production_environment,
        description
    } = envConfig[DEPLOYMENT_ENVIRONMENT];

    const deploymentRef = context.eventName === "pull_request_target"
        ? context.payload.pull_request!.head.sha
        : context.sha;

    const deployment = await octokit.rest.repos.createDeployment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: deploymentRef,
        environment,
        production_environment,
        description,
        required_contexts: [],
        auto_merge: false,
    });

    if (deployment.status !== 201) {
        error(deployment.data.message ?? "error creating deployment", {
            title: "Deployment Failed",
        });

        return 1;
    }

    await octokit.rest.repos.createDeploymentStatus({
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
| **Last commit:**               | ${deploymentRef}        |
| **${environment} URL**:        | ${DEPLOYMENT_URL}       |
| **Branch ${environment} URL**: | ${DEPLOYMENT_ALIAS_URL} |`,
        )
        .write();

    return 0;
}

process.exit(await main());
