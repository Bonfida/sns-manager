#!/bin/bash

# Get current branch
currentBranch=$(git rev-parse --abbrev-ref HEAD)

# Find files that differ from master
files=$(git diff --name-only master..$currentBranch | grep -E '\.(js|jsx|ts|tsx)$')

# Check if there are any differing files
if [ -z "$files" ]
then
    exit 0
fi

# Run prettier on these files
for file in $files
do
    if [ -f $file ]
    then
        prettier --write $file
    else
        echo "$file does not exist anymore."
    fi
done

echo "Prettier has finished running."
