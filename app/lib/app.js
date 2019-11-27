// for web framework
const express = require('express');
const app = express();

// nunjucks for template rendering
// https://mozilla.github.io/nunjucks/getting-started.html
const nunjucks = require('nunjucks');
nunjucks.configure('/app/views', {
	express: app,
	autoescape: true,
	noCache: true
});
app.set('view engine', 'html');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(express.urlencoded({
	extended: false
}));

// init our file-based session storage
const session = require('express-session');
const FileStore = require('session-file-store')(session);
app.use(
  session({
	store: new FileStore({
		path: '/app/.data',
		ttl: 86400
	}),
	resave: false,
	saveUninitialized: true,
	secret: process.env.SESSION_STORE_SECRET
})
);

module.exports = {
	app
};
