const express = require("express");
//const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
//http://localhost:8080/urls

const { users, urlDatabase, getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

// middleware
app.use(express.urlencoded({ extended: true }));

//app.use(cookieParser());
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = { user, urls };
    res.render("urls_index", templateVars);
    // redirect to /urls
    res.redirect("/urls");
  }
});

// add additional endpoints
app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase); // => {"b2xVn2":"http://www.lighthouselabs.ca","9sm5xK":"http://www.google.com"}
});


app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  //console.log("user", user);
  if (!user) {
    res.statusCode = 400;
  }
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { user, urls };
  //console.log("templateVars", templateVars);
  res.render("urls_index", templateVars);
 });
 
 app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const templateVars = { user };
    res.render("urls_new", templateVars);  
  } else {
    res.redirect("/login"); // If the user is not logged in, redirect GET /urls/new to GET /login
  }
 });

 //urls_show
 app.get("/urls/:id", (req, res) => {
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  // console.log("req.session.user_id", req.session.user_id);
  // console.log("req.params.id", req.params.id)
  // console.log(urlDatabase);
  // console.log("urlDatabase[req.params.id]", urlDatabase[req.params.id]);
  const user = users[req.session.user_id];
  const id = req.params.id;
  const currentUserID = req.session.user_id;
  const userIDOfUrl = urlDatabase[req.params.id].userID;


  if (!user) {
    return res.status(400).send("Please login or register!")
  }
  if (currentUserID !== userIDOfUrl) {
    return res.status(401).send("Sorry, you are not authorized to edit the url!")
  }
  const longURL = urlDatabase[req.params.id].longURL;
  
  const templateVars = {user, id, longURL};
  //console.log("templateVars", templateVars);
  res.render("urls_show", templateVars);
 });

// Redirect to long url
// Redirect any request to "/u/:id" to its longURL
// Every user should be able to visit /u/:id whether they are logged in or not
app.get("/u/:id", (req, res) => {
  const id = urlDatabase[req.params.id];
  if (id) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    return res.status(404).render('This short url does not exist.');
  }
});

// urls_new 
// POST route to expressserver.js to receive form submission
app.post("/urls", (req, res) => {
 //console.log(req.body); //{ longURL: 'www.google.ca' }
 
 // the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
 const user = users[req.session.user_id];
 const userID = req.session.user_id;
 const newid = generateRandomString();
 const { longURL } = req.body;
  
 if (!user) {
   return res.status(400).send("Please log in first so that you can create short urls.")
 }
 urlDatabase[newid] = { longURL, userID };
 res.redirect(`/urls/${newid}`);// when it receives a POST request to /urls it responds with a redirection to /urls/:id.
});

// url edit 
app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const id = req.params.id;
  const longURL = req.body.longURL;

  console.log("id:", id);
  console.log("longURL:", longURL);
  console.log("user:", user);

  // when edit the url, if enter emtpy, then send error message
  if (!id || !longURL) {
    const errorMessage = 'Short url or long url does not exist.';
    return res.status(401).send(errorMessage);
  }
  if (!user) {
    return res.status(400).send("Please log in first!");
  }
  if (user !== urlDatabase[id].userID) {
    return res.status(401).send("You are not authorized to do remove this url.");
  }
  // If user is logged in and owns the URL, then update URL and redirect to /urls
  urlDatabase[id].longURL = longURL;
  res.redirect(`/urls`);
});

// Add POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  const id = req.params.id;
  if (!user) {
    return res.status(400).send("Please log in first!");
  }
  if (user !== urlDatabase[id].userID)  {
    return res.status(401).send("You are not authorized to do remove this url.");
  }
  // If user is logged in and owns the URL, then delete URL and redirect to /urls
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const email = req.session.email;

  const templateVars = {user, email};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {  
  //const id = req.body.id;
  //Use new email and password fields to look up email address submitted via form
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === '' || password === '') {
    return res.status(400).send("Email or password is invaild!");
  }
  const existedUser = getUserByEmail(email, users);
  if (!existedUser) {
    return res.status(400).send("Your email hasn't registered yet!");
  } else if (existedUser) {
    //use bcrypt to check the password
    if (bcrypt.compareSync(password, existedUser.password)) {
      //console.log(password, existedUser.password);

      //Set an appropriate userid cookie on successful login
      req.session.user_id = existedUser.id;
      res.redirect("/urls");// If the user is logged in, GET /login should redirect to GET /urls
    } else {
      //console.log(password, existedUser.password);
      return res.status(403).send("Your password is wrong!");
    }     
  }
});

app.get("/register", (req, res) => {

  const user = users[req.session.user_id];
  const urls = urlDatabase;

  const templateVars = { user, urls };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  // To generate a random user ID
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // Use bcrypt to hash and save password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = {
    id, email, password
  };

  if (email === '' || password === '') {
    return res.status(400).send("Email or password is invaild, please check them.");
  }
  
  const userAlreadyExist = getUserByEmail(email, users);
  //If someone tries to register with an email that already exists in users object, send response back with 400 status code
  if (userAlreadyExist) {
    return res.status(400).send(`User with ${email} is already registered.`)
  } else {
    const newUser = {id, email, password: hashedPassword};
    //console.log(newUser);
    users[newUser.id] = newUser;
    //res.cookie('user_id', newUser.id);
    req.session.user_id = newUser.id;
    res.redirect("/urls"); // If the user is logged in, redirect the user to the /urls page.
  }
});


 app.post("/logout", (req, res) => {  
  //clear userid cookie
  res.clearCookie("session");
  res.redirect("/login");
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


