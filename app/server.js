const { app } = require('./lib/app');
const handlers = require('./lib/handlers');
const logger = require('./lib/logger');

// set up handlers for each route
app.get('/', handlers.getRoot);
app.get('/messages/:userId', handlers.getConversation);
app.get('/sent', handlers.getSent);
app.get('/login', handlers.login);
app.get('/logout', handlers.logout);
app.get('/oauth', handlers.completeOauth);
app.get('/health-check', handlers.healthCheck);
app.post('/messages', handlers.validateMessage(), handlers.postMessage);

// listen for requests :)
const listener = app.listen(process.env.PORT || 8000, process.env.HOST || '0.0.0.0', () => {
  logger.info(`Your app is listening on port ${listener.address().port}`);
});
