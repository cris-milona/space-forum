const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const sharp = require('sharp');
const { getUsersPosts } = require('../utils/functions');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = new express.Router();

// setting up multer
const upload = multer({
  limits: {
    fileSize: 1000000000,
  },
  fileFilter(req, file, cd) {
    if (
      !file.originalname.endsWith('.png') &&
      !file.originalname.endsWith('.jpg') &&
      !file.originalname.endsWith('.gif')
    ) {
      return cd(new Error('File must be of type .png, .jpg or .gif'));
    }
    cd(undefined, true);
  },
});

// sign up
router.post('/signup', async (req, res) => {
  const user = new User(req.body);
  try {
    await User.checkIfUserExists(user);
    await user.save();
    req.session.userId = user._id;
    res.status(201).redirect('/');
  } catch (e) {
    res.status(503).render('signup', { user: null, error: e.message });
  }
});

// sign in to account
router.post('/signin', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    req.session.userId = user._id;
    user.online = true;
    await user.save();
    res.status(200).redirect('/');
  } catch (e) {
    res.status(503).render('signin', { user: null, error: e.message });
  }
});

// logout from account
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.online = false;
    await req.user.save();
    // destroy on server side
    req.session.destroy((error) => {
      if (error) {
        return res.status(400).redirect('/account');
      }
    });
    // destroy on client side
    res.clearCookie(process.env.SESS_NAME);
    res.status(200).redirect('/signin');
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

// fetch user account
router.get('/user/account', auth, async (req, res) => {
  try {
    await getUsersPosts();
    res.status(200).render('account', { user: req.user });
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

// update user account
router.post('/account/update', auth, async (req, res) => {
  const allowedUpdates = ['username', 'password'];
  const requestedUpdates = Object.keys(req.body);
  const isValidUpdate = requestedUpdates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidUpdate) {
    return res.status(500).send('Invalid update');
  }
  try {
    requestedUpdates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.status(200).redirect('/account');
  } catch (e) {
    res.status(503).send(e.message);
  }
});

// delete user account
router.delete('/account/delete', auth, async (req, res) => {
  try {
    await User.deleteOne(req.user);
    //destroy on server side
    req.session.destroy((error) => {
      if (error) {
        return res.status(400).redirect('/account');
      }
    });
    // destroy on client side
    res.clearCookie(process.env.SESS_NAME);
    res.status(200).send('User account deleted');
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

// upload-update an avatar
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 300, height: 300 })
        .png()
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.status(200).redirect('/account');
    } catch (e) {
      res
        .status(503)
        .render('error', { user: req.user, errorMessage: e.message });
    }
  }
);

// delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send('Avatar deleted');
  } catch (e) {
    res
      .status(503)
      .render('error', { user: req.user, errorMessage: e.message });
  }
});

module.exports = router;
