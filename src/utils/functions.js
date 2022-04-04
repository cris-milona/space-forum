const User = require('../models/user');
const Topic = require('../models/topic');

// who is online
const whoIsOnline = async () => {
  const usersOnline = await User.find({ online: true });
  const usernames = usersOnline.map((user) => {
    return user.username;
  });
  return usernames;
};

// get all topics from the database
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

// get all posts a user has created
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

// handle search cases
const searchTerms = async (req) => {
  const topics = await Topic.find({});
  let message;
  //the search input is empty
  if (req.body.search === '') {
    return {
      message: 'Please provide a search term',
      searchResults: [],
      topics,
    };
  }
  // user has typed something
  const searchResults = [];
  const searchTerms = req.body.search.toLowerCase().split(' ');
  searchTerms.forEach((term) => {
    const filterResults = topics.filter((topic) => {
      return topic.title.toLowerCase().includes(term);
    });
    searchResults.push(...filterResults);
  });

  if (searchResults.length === 0) {
    message = 'This topic does not exist';
  }

  return { message, searchResults, topics };
};

module.exports = { whoIsOnline, getUsersPosts, fetchAllTopics, searchTerms };
