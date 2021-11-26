const express = require('express');
const Topic = require('../models/topic');
const auth = require('../middleware/auth');
const { whoIsOnline } = require('../utils/functions');
const Post = require('../models/post');
const User = require('../models/user');

const router = new express.Router();

//create new topic
router.post('/topics/create', auth, async (req, res) => {
  try {
    const topic = new Topic(req.body);

    await topic.save();
    res.redirect(`/topics/find/${topic._id}`);
  } catch (e) {
    res.render('error', { user: req.user, errorMessage: e.message });
  }
});

//fetch specific topic and its posts
router.get('/topics/find/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    await topic.populate('posts').execPopulate();

    const authors = await Promise.all(
      topic.posts.map(async (post) => {
        const author = await User.findById(post.owner);

        return author.username;
      })
    );

    const user = await User.findById(req.session.userId);

    res.render('topic', { user: user || null, topic, authors });
  } catch (e) {
    res.render('error', { user: req.user, errorMessage: e.message });
  }
});

//search for specific topic
router.post('/topics/search', auth, async (req, res) => {
  try {
    const topics = await Topic.find({});
    const searchTerms = req.body.search.toLowerCase().split(' ');
    const searchResults = [];

    searchTerms.forEach((term) => {
      const filterResults = topics.filter((topic) => {
        return topic.title.toLowerCase().includes(term);
      });
      searchResults.push(...filterResults);
    });

    let message;
    if (searchResults.length === 0) {
      message = 'Topic not found, try another search';
    }
    const usernamesOnline = await whoIsOnline();

    res.render('home', {
      user: req.user,
      usernamesOnline,
      topics,
      searchResults,
      message,
    });
  } catch (e) {
    res.render('error', { user: req.user, errorMessage: e.message });
  }
});

module.exports = router;
