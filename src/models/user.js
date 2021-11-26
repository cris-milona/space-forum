const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    trim: true,
    minlength: 8,
    validate(value) {
      if (value.length < 8) {
        throw new Error('Invalid password');
      }
    },
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email address');
      }
    },
  },
  avatar: {
    type: Buffer,
  },
  online: {
    type: Boolean,
    default: true,
  },
});

//hide sensitive information before sending back the response object
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

//actions to happen before saving a user in the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

//check if the user already exists in the database
userSchema.statics.checkIfUserExists = async function (user) {
  const existUsername = await User.findOne({ username: user.username });
  if (existUsername) {
    throw new Error('Username already in use. Please try another one');
  }
  const existEmail = await User.findOne({ email: user.email });
  if (existEmail) {
    throw new Error('Email already subscribed.');
  }
};

//find specific user
userSchema.statics.findByCredentials = async function (email, password) {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new Error('Please check your credentials and try again');
  }
  const match = await bcrypt.compare(password, existingUser.password);
  if (!match) {
    throw new Error('Please check your credentials and try again');
  }
  return existingUser;
};

//creates a virtual connection with post model
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'owner',
});

const User = mongoose.model('User', userSchema);

module.exports = User;
