// data model
const model = require('./model');
const { body, validationResult } = require('express-validator');
const logger = require('../lib/logger');

// for GitHub API
const Octokit = require('@octokit/rest');

// for OAuth authorization "state" generation
const crypto = require('crypto');

// for HTTP request
const axios = require('axios');
// (...we want JSON by default)
axios.defaults.headers.common.Accept = 'application/json';

// server-side validation rules for incoming new message form
module.exports.validateMessage = () => {
  return [
    body('message')
      .not().isEmpty()
      .trim()
      .escape()
  ];
};

module.exports.getRoot = async (request, response) => {
  if (request.session.token) {
    const messages = await model.messagesReceivedList(request.session.viewData.user.id);

    // expose various parameters to template via viewData
    request.session.viewData.messages = messages;
    request.session.viewData.selectedBox = 'Inbox';
    // empty out any conversation data
    delete request.session.viewData.messages;
    delete request.session.viewData.conversation;
    delete request.session.viewData.selectedFollower;
  }

  // render and send the page
  response.render('index', {
    title: process.env.TITLE,
    ...request.session.viewData
  });
};

module.exports.getConversation = async (request, response) => {
  if (request.session.token) {
    const userId = request.params.userId; // github user id
    const messages = await model.messagesBetween(request.session.viewData.user.id, userId);

    // expose authenticated user to template via viewData
    request.session.viewData.messages = messages;
    request.session.viewData.conversation = userId;
    request.session.viewData.selectedFollower = request.session.viewData.followers.find(follower => parseInt(follower.id, 10) === parseInt(userId, 10));

    // render and send the page
    response.render('index', {
      title: process.env.TITLE,
      ...request.session.viewData
    });
  } else {
    return response.redirect('/');
  }
};

module.exports.getSent = async (request, response) => {
  if (request.session.token) {
    const messages = await model.messagesSentList(request.session.viewData.user.id);

    request.session.viewData.messages = messages;
    request.session.viewData.selectedBox = 'Sent';

    // render and send the page
    response.render('index', {
      title: process.env.TITLE,
      ...request.session.viewData
    });
  } else {
    return response.redirect('/');
  }
};

module.exports.postMessage = async (request, response) => {
  const message = request.body.message;

  if (validationResult(request).array().length) {
    // error
    response.redirect('/');
  } else {
    await model.messageAdd({
      toId: request.session.viewData.selectedFollower.id,
      to: request.session.viewData.selectedFollower.login,
      fromId: request.session.viewData.user.id,
      from: request.session.viewData.user.login,
      message
    });

    response.redirect(`/messages/${request.session.viewData.selectedFollower.id}`);
  }
};

module.exports.login = async (request, response) => {
  // generate a random state
  const state = crypto
    .createHmac('sha1', process.env.CLIENT_SECRET)
    .update(Math.random().toString())
    .digest('hex')
    .substring(0, 8);

  return response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&state=${state}`
  );
};

module.exports.logout = async (request, response) => {
  // delete the token and viewData
  delete request.session.token;
  delete request.session.viewData;

  // go home
  return response.redirect('/');
};

// for completing OAuth authorization flow

module.exports.completeOauth = async (request, response) => {
  const code = request.query.code;
  const state = request.query.state;

  if (code) {
    // exchange for token
    // per, https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#2-users-are-redirected-back-to-your-site-by-github
    const token = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        state: state,
        redirect_uri: process.env.REDIRECT_URI
      }
    );

    // preserve token in session storage
    request.session.viewData = {};
    request.session.token = token.data.access_token;

    const github = new Octokit({
      auth: request.session.token
    });

    // get followers of authenticated user
    // paginated to 30 by default; this grabs them all per https://octokit.github.io/rest.js/#pagination
    const followersPage = github.users.listFollowersForAuthenticatedUser.endpoint.merge({ per_page: 100 });
    const followers = (await github.paginate(followersPage));
    // get authenticated user
    const currentUser = await github.users.getAuthenticated();

    logger.info(`Retrieved ${followers.length} followers.`);

    // sort followers by login, alphabetically, ignoring case
    followers
      .sort((a, b) => a.login.toLowerCase().localeCompare(b.login.toLowerCase()));
    logger.debug(`Followers: ${JSON.stringify(followers.map(f => f.login), null, 4)}`);

    request.session.viewData.followers = followers;
    request.session.viewData.user = currentUser.data;

    // redirect home
    return response.redirect('/');
  }

  // not found
  response.status(404).send('Not found');
};

// for alb health check
module.exports.healthCheck = async (request, response) => {
  response.status(200).send('OK');
};
