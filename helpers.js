


const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  const userURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURLs[key] = {
        longURL: urlDatabase[key].longURL,
        userID: urlDatabase[key].userID
      }
    }
  }
  return userURLs;
};

module.exports = { getUserByEmail, urlsForUser }