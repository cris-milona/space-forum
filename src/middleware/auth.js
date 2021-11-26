const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      throw new Error('You are not auhorized to perform this action.');
    }
    req.user = user;
    next();
  } catch (e) {
    res.render('error', { user: null, errorMessage: e.message });
  }
};

module.exports = auth;
