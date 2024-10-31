const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



const generateRandomString = function() {
  let random = Math.random().toString(36);
  return random.slice(2, 8);
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  sgq3y6: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "12345",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "54321",
  },
  aj48lW: {
    id: 'aj48lW',
    email: 'd@d.com',
    password: "12345"
  }
};

const urlsForUser = function(id) {
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
}

const getUserByEmail = function(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
};

app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  res.send("Hello");
});

app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  if (!templateVars.user) {
    return res.send("You need an account to use TinyApp");
  }
  let shortId = generateRandomString();
  urlDatabase[shortId] = {
    longURL: req.body.longURL,
    userID: req.cookies['userId']
  };
  res.redirect(`/urls/${shortId}`); 
});

app.get("/urls", (req, res) => {
  if (!req.cookies['userId']) {
    return res.send("You need to login or register in order to see URLs");
  }
  const urls = urlsForUser(req.cookies["userId"]);
  
  const templateVars = { 
    user: users[req.cookies.userId],
    urls, };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  if (!templateVars.user) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies['userId']) {
    return res.send('You need to be logged in to see URLs');
  }
  if (req.cookies['userId'] !== urlDatabase[req.params.id].userID) {
    return res.status(401).send('This URL does not belong to you');
  }
  const templateVars = {
    user: users[req.cookies.userId],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL};
  res.render("urls_show", templateVars)
});

app.get("/u/:id", (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send("The URL you have requested is not in the database");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


app.post("/urls/:id", (req, res) => {
  if (req.cookies['userId'] !== urlDatabase[req.params.id].userID || !req.cookies['userId']) {
    return res.status(401).send("You cannot delete this URL");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("URL does not exist");
  }
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});
app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies['userId'] !== urlDatabase[req.params.id].userID || !req.cookies['userId']) {
    return res.status(401).send("You cannot delete this URL");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("URL does not exist");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(403).send('You must provide an email and password to proceed');
  }
  if (!getUserByEmail(email)) {
        return res.status(403).send('No user with that email found');
      }
      if (getUserByEmail(email).password !== password) {
         return res.status(403).send('Passwords do not match');
      }
  res.cookie('userId', getUserByEmail(email).id)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/login');
});


app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  if (templateVars.user) {
    return res.redirect('/urls');
  }
  res.render("register", templateVars);
})

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('You must provide an email and password.');
  }
  if (getUserByEmail(email)) {
        return res.status(400).send('email already in use');
      }
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: password
  };
  users[id] = newUser;
  res.cookie('userId', id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  if (templateVars.user) {
    return res.redirect('/urls');
  }
  res.render('login', templateVars);
});

app.get("/urls.json", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

