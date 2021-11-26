const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (value.length > 40) {
          throw new Error('Topic title cannot be over 40 characters');
        }
      },
    },
    description: {
      type: String,
      trim: true,
      validate(value) {
        if (value.length > 120) {
          throw new Error('Description cannot be over 120 characters');
        }
      },
    },
    topicStatus: {
      type: String,
      default: 'open',
    },
    postsNumber: {
      type: Number,
    },
  },

  { timestamps: true }
);

//creates a virtual connection with post model
topicSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'relatedTopic',
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
