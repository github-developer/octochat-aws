const cleanMessages = (msgs) => {
  const messages = JSON.parse(msgs.data.Payload);
  return messages.data.map((message) => {
    return {
      ...message,
      receivedAt: (new Date(message.receivedAt * 1000)).toLocaleString()
    };
  });
};

module.exports = {
  cleanMessages
};
