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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
};

const getUserByEmail = function(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
};


app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  let shortId = generateRandomString();
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`/urls/${shortId}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies.userId],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars)
});

app.get("/u/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
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

app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
  res.send("Hello");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userId]
  };
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

