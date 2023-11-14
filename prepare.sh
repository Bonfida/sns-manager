#!/bin/bash

# Install pre-commit hooks
if ! husky install; then
  echo "Failed to install husky hooks"
  exit 0
fi

# Setup .git-blame-ignore-revs
if ! git config blame.ignoreRevsFile .git-blame-ignore-revs; then
  echo "Failed to set up .git-blame-ignore-revs"
  exit 0
fi
