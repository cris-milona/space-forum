const User = require('../models/user');
const Topic = require('../models/topic');

//who is online
const whoIsOnline = async () => {
  const usersOnline = await User.find({ online: true });
  const usernames = usersOnline.map((user) => {
    return user.username;
  });
  return usernames;
};

const fetchAllTopics = async (req, res) => {
  const match = {};
  if (req.query.topicStatus) {
    match.topicStatus = req.query.topicStatus;
  }
  try {
    const topics = await Topic.find(match);
    return topics;
  } catch (e) {
    res.status(500).send(e);
  }
};

//get all posts a user has created
const getUsersPosts = async (req) => {
  await req.user.populate({
    path: 'posts',
    options: {
      sort: { createdAt: '-1' },
    },
  });
  const results = req.user.posts.map((post) => {
    return post.content;
  });
  return results;
};

module.exports = { whoIsOnline, getUsersPosts, fetchAllTopics };
