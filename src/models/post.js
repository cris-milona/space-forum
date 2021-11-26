const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length > 2000) {
          throw new Error("Post's maximum length is 2000 characters");
        }
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    relatedTopic: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Topic',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
