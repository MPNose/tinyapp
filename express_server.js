const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

const generateRandomString = function() {
  let random = Math.random().toString(36);
   return random.slice(2, 8);
};
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.post("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  let shortId = generateRandomString();
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`/urls/${shortId}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies['username'],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars)
});

app.get("/u/:id", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.cookie('username', req.body.username);
  res.redirect("/urls");
})

app.get("/", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

