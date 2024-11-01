const { assert } = require('chai');


const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = testUsers.userRandomID;
    assert.equal(user, expectedUserID);
  });


  it('should return undefined if the email is not in our database', function() {
    const user = getUserByEmail("notanemail@email.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

});




describe('urlsForUser', function() {
  const urlDatabase = {
    'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user123' },
    '9sm5xK': { longURL: 'http://www.google.com', userID: 'user456' },
    'h3pVn3': { longURL: 'http://www.example.com', userID: 'user123' }
  };

  it('should return only the URLs that belong to the specified user', function() {
    const userID = 'user123';
    const expectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user123' },
      'h3pVn3': { longURL: 'http://www.example.com', userID: 'user123' }
    };
    
    const result = urlsForUser(userID, urlDatabase);
    
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no URLs', function() {
    const userID = 'user999'; // User with no URLs
    const expectedOutput = {};
    
    const result = urlsForUser(userID, urlDatabase);
    
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const userID = 'user123';
    const expectedOutput = {};
    
    const result = urlsForUser(userID, {}); // Passing an empty database
    
    assert.deepEqual(result, expectedOutput);
  });

  it('should not return any URLs that do not belong to the specified user', function() {
    const userID = 'user456'; // This user has one URL
    const expectedOutput = {
      '9sm5xK': { longURL: 'http://www.google.com', userID: 'user456' }
    };
    
    const result = urlsForUser(userID, urlDatabase);
    
    assert.deepEqual(result, expectedOutput);
    
    const otherUserId = 'user123'; // This user has two URLs
    const otherExpectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user123' },
      'h3pVn3': { longURL: 'http://www.example.com', userID: 'user123' }
    };
    
    const otherResult = urlsForUser(otherUserId, urlDatabase);
    
    // Assert that the other user does not include the URLs of user456
    assert.notDeepEqual(otherResult, expectedOutput);
  });
});
