#!/bin/sh

# Run commitlint on the commit message
npx --no -- commitlint --edit "$1" || exit 1

# If commitlint passes, run standard-version
npx standard-version --skip.changelog --skip.tag --skip.bump --skip.commit
