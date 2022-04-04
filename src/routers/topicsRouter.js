const express = require('express');
const auth = require('../middleware/auth');
const { whoIsOnline, searchTerms } = require('../utils/functions');
const Topic = require('../models/topic');
const User = require('../models/user');

const router = new express.Router();

// create new topic
router.post('/topics/create', auth, async (req, res) => {
  try {
    const topic = new Topic(req.body);

    await topic.save();
    res.status(201).redirect(`/topics/find/${topic._id}`);
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

// fetch specific topic and its posts
router.get('/topics/find/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    await topic.populate('posts');

    const authors = await Promise.all(
      topic.posts.map(async (post) => {
        const author = await User.findById(post.owner);
        return author.username;
      })
    );

    const user = await User.findById(req.session.userId);

    res.status(200).render('topic', { user: user || null, topic, authors });
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

// search for specific topic
router.post('/topics/search', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      const { message, searchResults, topics } = await searchTerms(req);
      res.status(200).render('home', {
        user: null,
        usernamesOnline: null,
        topics,
        searchResults,
        message,
      });
    } else {
      const usernamesOnline = await whoIsOnline();
      const { message, searchResults, topics } = await searchTerms(req);
      res.status(200).render('home', {
        user,
        usernamesOnline,
        topics,
        searchResults,
        message,
      });
    }
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

module.exports = router;
