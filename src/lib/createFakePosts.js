const Post = require("../models/post");

module.exports = function createFakePosts() {
  const posts = [...Array(40).keys()]
    .map((i) => i + 1)
    .map(
      (i) =>
        new Post({
          title: `title #${i}`,
          body: `body`,
          tags: [`tag${i}`],
          author: {
            username: "admin",
            _id: "5e89965da6b0ea37e8f4d4bd",
          },
        })
    );
  Post.insertMany(posts);
};
