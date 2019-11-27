// https://aws.amazon.com/sdk-for-node-js/
const aws = require('aws-sdk');
const lambda = new aws.Lambda();
const utilities = require('./utilities');

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

  return utilities.cleanMessages(await invokeLambda(params));
};

// list the 50 most recently sent messages
const messagesSentList = async (fromId) => {
  const params = {
    FunctionName: 'messages_sent_list',
    Payload: `{
            "fromId": ${fromId}
        }`
  };

  return utilities.cleanMessages(await invokeLambda(params));
};

// get messages between two user ids
const messagesBetween = async (user1, user2) => {
  // gather messages from user2 sent to user1
  const received = (await messagesReceivedList(user1)).filter(msg => msg.fromId == user2);
  // gather messages to user2 sent by user1
  const sent = (await messagesSentList(user1)).filter(msg => msg.toId == user2);
  // combine into one array and sort by received date
  return [].concat(received, sent).sort((a,b) => new Date(a.receivedAt) - new Date(b.receivedAt));
};


module.exports = {
  messageAdd,
  messagesReceivedList,
  messagesSentList,
  messagesBetween
};
