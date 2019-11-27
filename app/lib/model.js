// https://aws.amazon.com/sdk-for-node-js/
const aws = require('aws-sdk');
const lambda = new aws.Lambda();
const cleanMessages = require('../lib/cleanMessages');

// Callback to Promise wrapper of lambda.invoke
const invokeLambda = async (params) => {
  // Convert callback to promise for easier handling
  return new Promise((resolve) => {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property
    lambda.invoke(params, (err, data) => {
      resolve({ err, data });
    });
  });
};

// send a message
const messageAdd = async (msgObj) => {
  const params = {
    FunctionName: 'message_add',
    Payload: `{"toId": ${msgObj.toId}, "to": "${msgObj.to}", "fromId": ${msgObj.fromId}, "from": "${msgObj.from}", "message": "${msgObj.message}"}`
  };

  return invokeLambda(params);
};

// list the 50 most recently received messages
const messagesReceivedList = async (toId) => {
  const params = {
    FunctionName: 'messages_received_list',
    Payload: `{
            "toId": ${toId}
        }`
  };

  return cleanMessages(await invokeLambda(params));
};

// list the 50 most recently sent messages
const messagesSentList = async (fromId) => {
  const params = {
    FunctionName: 'messages_sent_list',
    Payload: `{
            "fromId": ${fromId}
        }`
  };

  return cleanMessages(await invokeLambda(params));
};

module.exports = {
  messageAdd,
  messagesReceivedList,
  messagesSentList
};
