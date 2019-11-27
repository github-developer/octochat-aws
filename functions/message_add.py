#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os
import datetime
import json

import boto3

from decimal import Decimal


def handler(event, context):
    dynamodb = boto3.resource("dynamodb", region_name="eu-west-1")
    table = dynamodb.Table("Messages")

    now = datetime.datetime.utcnow()
    timestamp = Decimal((now.replace(microsecond=0) - \
        datetime.datetime(1970, 1, 1)).total_seconds())

    table.put_item(
       Item={
           "toId": event["toId"],
           "to": event["to"],
           "fromId": event["fromId"],
           "from": event["from"],
           "receivedAt": timestamp,
           "message": event["message"],
        }
    )

    return True


if __name__ == "__main__":
    # Read event, context from sys.argv
    args = [json.loads(arg) for arg in sys.argv[1:2]]

    # Provide None for event, context if not provided
    while len(args) < 2:
        args.append(None)

    # Print the output
    print(handler(*args))
