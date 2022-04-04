const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const Post = require('../models/post');

const router = new express.Router();

const upload = multer({
  limits: {
    fileSize: 5000000000,
  },
});

// create new post
router.post('/posts/create/:id', auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      owner: req.user._id,
      relatedTopic: req.params.id,
    });

    await post.populate('owner');
    await post.save();
    res.status(201).redirect(`/topics/find/${req.params.id}`);
  } catch (e) {
    const errorMessage = 'You cannot post if you are not logged in';
    res.status(401).render('error', { user: req.user, errorMessage });
  }
});

// delete a post
router.delete('/posts/delete/:id', auth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).send('Post deleted successfully');
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

module.exports = router;
