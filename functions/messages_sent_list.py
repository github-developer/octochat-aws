#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os
import datetime
import json

import boto3
from boto3.dynamodb.conditions import Key

from decimal import Decimal


def handler(event, context):
    dynamodb = boto3.resource("dynamodb", region_name="eu-west-1")
    table = dynamodb.Table("Messages")

    # Get most recent messages sent
    results = table.query(
        IndexName="SentMessages",
        KeyConditionExpression=Key("fromId").eq(event["fromId"]),
        Limit=50,
        ScanIndexForward=False
    )

    return dict(data=results["Items"])


if __name__ == "__main__":
    # Read event, context from sys.argv
    args = [json.loads(arg) for arg in sys.argv[1:2]]

    # Provide None for event, context if not provided
    while len(args) < 2:
        args.append(None)

    # Print the output
    print(json.dumps(handler(*args), indent=4))
