const express = require('express');
const auth = require('../middleware/auth');
const {
  whoIsOnline,
  getUsersPosts,
  fetchAllTopics,
} = require('../utils/functions');
const { redirectHome } = require('../middleware/redirect');
const User = require('../models/user');

const router = new express.Router();

//home page
router.get('/', async (req, res) => {
  try {
    const topics = await fetchAllTopics(req, res);
    topics.forEach(async (topic) => {
      await topic.populate('posts').execPopulate();
      topic.postsNumber = topic.posts.length;
      await topic.save();
    });

    if (!req.session.userId) {
      res.render('home', {
        user: null,
        usernamesOnline: null,
        topics,
        searchResults: null,
        message: null,
      });
    } else {
      const user = await User.findById(req.session.userId);
      const usernamesOnline = await whoIsOnline();
      res.render('home', {
        user,
        usernamesOnline,
        topics,
        searchResults: null,
        message: null,
      });
    }
  } catch (e) {
    res.status(500).send();
  }
});

//sign-in page
router.get('/signin', redirectHome, (req, res) => {
  res.render('signin', { user: req.user, error: null });
});

//sign-up page
router.get('/signup', redirectHome, (req, res) => {
  res.render('signup', { user: req.user, error: null });
});

//account
router.get('/account', auth, async (req, res) => {
  const posts = await getUsersPosts(req);
  res.render('account', { user: req.user, posts });
});

module.exports = router;
