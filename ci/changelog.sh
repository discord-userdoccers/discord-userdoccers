#!/usr/bin/env bash

set -e

if [[ -z $GITHUB_PULL_TITLE ]]; then
  COMMIT_MSG=$(git log -1 --pretty=%B)
else
  COMMIT_MSG=$GITHUB_PULL_TITLE
fi

for word in $COMMIT_MSG
do
  if [[ "$word" == "[no-changelog]" ]]; then
    echo "Skipping Changelog Check"
    exit 0
  fi
done

git remote add temp "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}"

echo "Getting HEAD info..."

if [[ -z $GITHUB_BASE_REF ]]; then
  PREVIOUS_SHA=$(git rev-parse HEAD^1 2>&1) && exit_status=$? || exit_status=$?

  if [[ $exit_status -ne 0 ]]; then
    echo "::warning::Unable to determine the previous commit sha"
    exit 1
  fi
else
  TARGET_BRANCH=$GITHUB_BASE_REF
  CURRENT_BRANCH=$GITHUB_HEAD_REF
  git fetch temp "${TARGET_BRANCH}":"${TARGET_BRANCH}"
  PREVIOUS_SHA=$(git rev-parse "${TARGET_BRANCH}" 2>&1) && exit_status=$? || exit_status=$?

  if [[ $exit_status -ne 0 ]]; then
    echo "::warning::Unable to determine the base ref sha for ${TARGET_BRANCH}"
    exit 1
  fi
fi

git diff --diff-filter=M --name-only "$PREVIOUS_SHA" "$GITHUB_SHA" | grep "pages/changelog.mdx" && MODIFIED=true || MODIFIED=false

git remote remove temp

if [[ $MODIFIED == false ]]; then
  echo "::error file=pages/changelog.mdx,title=Missing Changelog::No Changes Found in changelog, add a changelog message or add [no-changelog] to your commit message or PR title"
  exit 1
fi

echo "Changelog modified!"
