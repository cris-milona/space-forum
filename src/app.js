const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('ejs');
const path = require('path');
const usersRouter = require('./routers/usersRouter');
const postsRouter = require('./routers/postsRouter');
const topicsRouter = require('./routers/topicsRouter');
const viewsRouter = require('./routers/viewsRouter');

require('./db/mongoose');

const app = express();

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirectoryPath));

//configure express-session
const HOUR = 1000 * 60 * 60;
app.use(
  session({
    name: process.env.SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: {
      maxAge: HOUR,
      sameSite: true,
    },
  })
);

app.use(usersRouter);
app.use(postsRouter);
app.use(topicsRouter);
app.use(viewsRouter);

app.set('view engine', 'ejs');

module.exports = app;
