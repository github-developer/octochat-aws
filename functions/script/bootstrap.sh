#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

function dependencies() {
    command -v aws >/dev/null 2>&1 || { echo >&2 "I require aws but it's not installed.  Aborting."; exit 1; }
    command -v jq >/dev/null 2>&1 || { echo >&2 "I require jq but it's not installed.  Aborting."; exit 1; }
}

function role_exists() {
    role="$1"

    # Check for role
    aws iam get-role \
        --role-name "$role" >/dev/null 2>&1

    if [[ $? -eq 0 ]]
    then
        # get-role didn't error, therefore role exists, return true
        # 0 = true!
        return 0
    else
        # get-role errored, therefore role does not exist, return false
        # 1 = false!
        return 1
    fi
}

function create_role() {
    role="$1"

    # Role options
    opts=()
    opts+=("--role-name"); opts+=("$role")
    # --assume-role-policy-document:
    #   The trust relationship policy document that grants an entity
    #   permission to assume the role.
    opts+=("--assume-role-policy-document"); opts+=("file://.aws/lambda-assume-role-policy.json")
    opts+=("--description"); opts+=("Lambda execution role")

    # Create the role
    aws iam create-role "${opts[@]}" > /dev/null

    # Role policy options
    opts=()
    opts+=("--role-name"); opts+=("$role")
    opts+=("--policy-name"); opts+=("lambda-full-access")
    opts+=("--policy-document"); opts+=("file://.aws/lambda-full-access-policy.json")

    # Add an inline policy document to role
    aws iam put-role-policy "${opts[@]}" > /dev/null
}

function table_exists() {
    table="$1"

    # Check for table
    aws dynamodb describe-table \
        --table-name "$table" >/dev/null 2>&1

    if [[ $? -eq 0 ]]
    then
        # describe-table didn't error, therefore table exists, return true
        # 0 = true!
        return 0
    else
        # describe-table errored, therefore table does not exist, return false
        # 1 = false!
        return 1
    fi
}

function create_table() {
    table="$1"
    table_lcase=$( echo "${table}" | tr '[:upper:]' '[:lower:]' )

    aws dynamodb create-table \
        --cli-input-json "file://.aws/dynamodb-${table_lcase}-table.json"

    aws dynamodb wait table-exists --table "${table}"
}

function main() {
    # Check dependencies
    dependencies

    cd $( dirname "$0" )/..

    # Make sure the role exists
    if ! role_exists "lambda-default"
    then
        echo "Creating lambda-default role..."
        create_role "lambda-default"
    fi

    # Make sure DynamoDB table exists
    if ! table_exists "Messages"
    then
        echo "Creating Messages table..."
        create_table "Messages"
    fi
}

main "$@"
