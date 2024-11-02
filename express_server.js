const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
const {getUserByEmail, urlsForUser} = require('./helpers');
const app = express();
const PORT = 8080;
const salt = bcrypt.genSaltSync(10);


app.use(cookieSession({
  name: 'session',
  keys: ['asdasdasd'],
})
);


app.set("view engine", "ejs");
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
};


app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  if (!templateVars.user) {
    return res.send("You need an account to use TinyApp");
  }
  let shortId = generateRandomString();
  urlDatabase[shortId] = {
    longURL: req.body.longURL,
    userID: req.session.userId
  };
  res.redirect(`/urls/${shortId}`); 
});


app.get("/urls", (req, res) => {
  if (!req.session['userId']) {
    return res.send("You need to login or register in order to see URLs");
  }
  const urls = urlsForUser(req.session.userId, urlDatabase);
  const templateVars = { 
    user: users[req.session.userId],
    urls, };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  if (!templateVars.user) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const urlData = urlDatabase[req.params.id];
  if (!urlData) {
    return res.status(404).send('URL not found');
  }
  if (!req.session['userId']) {
    return res.send('You need to be logged in to see URLs');
  }
  if (req.session['userId'] !== urlData.userID) {
    return res.status(401).send('This URL does not belong to you');
  }
  const templateVars = {
    user: users[req.session.userId],
    id: req.params.id, 
    longURL: urlData.longURL
  }
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send("The URL you have requested is not in the database");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


app.post("/urls/:id", (req, res) => {
  if (req.session['userId'] !== urlDatabase[req.params.id].userID || !req.session['userId']) {
    return res.status(401).send("You cannot delete this URL");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("URL does not exist");
  }
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[id].longURL = newLongURL;
  res.redirect('/urls');
});


app.post("/urls/:id/delete", (req, res) => {
  if (req.session['userId'] !== urlDatabase[req.params.id].userID || !req.session['userId']) {
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
  const user = getUserByEmail(email, users);
  if (!user) {
        return res.status(403).send('No user with that email found');
      }
      const result = bcrypt.compareSync(password, user.password);
      if (!result) {
         return res.status(403).send('Passwords do not match');
      }
  req.session.userId = user.id;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  if (templateVars.user) {
    return res.redirect('/urls');
  }
  res.render("register", templateVars);
});


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('You must provide an email and password.');
  }
  if (getUserByEmail(email, users)) {
        return res.status(400).send('email already in use');
      }
  const hash = bcrypt.hashSync(password, salt);
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: hash
  };
  users[id] = newUser;
  req.session.userId = id;
  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  if (templateVars.user) {
    return res.redirect('/urls');
  }
  res.render('login', templateVars);
});


app.get("/urls.json", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

