const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const app = express();
const PORT = 8080; // default port 8080
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

const getUserByEmail = (userEmail) => {
  for (const key in users) {
    if (users[key].email === userEmail) {
      return users[key];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// add additional endpoints
app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase); // => {"b2xVn2":"http://www.lighthouselabs.ca","9sm5xK":"http://www.google.com"}
});


// add route
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});
// curl -i http://localhost:8080/hello

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get("/urls", (req, res) => {
  //const templateVars = {urls: urlDatabase};
  //res.render("urls_index", templateVars);

  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
 });
 
 //after urls_new 
 //Add POST route to expressserver.js to receive form submission
 app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console //{ longURL: 'www.google.ca' }
  //res.send("Ok. We are redirecting you to the new page you just created."); // Respond with 'Ok' (we will replace this)
  
  // the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  const user = users[req.cookies.user_id];
  if (user) {
    const newid = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[newid] = longURL;
    res.redirect(`/urls/${newid}`);// when it receives a POST request to /urls it responds with a redirection to /urls/:id.

  } else {
    res.status(400).send("Please log in first so that you can create short urls.")
  }

});

 app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    const templateVars = { user };
    res.render("urls_new", templateVars);  
  } else {
    //res.redirect("/login"); //If the user is not logged in, redirect GET /urls/new to GET /login
    return res.status(400).send("Please login first!")
  }
 });

 //urls_show
 app.get("/urls/:id", (req, res) => {
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  const user = users[req.cookies.user_id];
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];

  const templateVars = {user, id, longURL};
  console.log("templateVars", templateVars);
  res.render("urls_show", templateVars);
 });

// redirect to long url
// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const id = urlDatabase[req.params.id];
  if (id) {
    res.redirect(urlDatabase[req.params.longURL]); //urlDatabase[req.params.shortURL].longURL
  } else {
    const user = users[req.cookies.user_id];
    const errorMessage = 'This short url does not exist.';
    res.status(404).render('urls_error', {user, errorMessage});
  }
});

// url edit 
app.post("/urls/:id", (req, res) => {
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  //const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  //res.render("urls_show", templateVars);
  // const id = req.params.id;
  // const longURL = req.body.longURL;
  // urlDatabase[id].longURL = longURL;
  const user = users[req.cookies.user_id];
  const id = req.params.id;
  //const longURL = urlDatabase[req.params.id];
  const longURL = req.body.longURL;
  console.log("id", id);
  console.log("longURL", longURL);

  //const templateVars = {id, longURL};
  
  // when edit the url, if enter emtpy, then send error message
  if (!id || !longURL) {
    const errorMessage = 'Short url or long url does not exist.';
    return res.status(401).send(errorMessage);
  } 
  urlDatabase[id] = longURL;
  console.log("urlDatabase[id]", urlDatabase[id]);
  console.log("longURL", longURL);

  res.redirect(`/urls`);
});

// Add POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];

  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  // To generate a random user ID
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = {
    id, email, password
  };

  if (email === '' || password === '') {
    return res.status(400).send("Email or password is invaild, please check them.");
  }
  //
  const userAlreadyExist = getUserByEmail(email);
  if (userAlreadyExist) {
    return res.status(400).send(`User with ${email} is already exist.`)
  } else {
    users[user.id] = user;
    res.cookie('user_id', user.id);
    res.redirect("/urls"); // If the user is logged in,, redirect the user to the /urls page.
  }
  console.log("Doing POST register");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {  
  //const id = req.body.id;
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    return res.status(400).send("Email or password is invaild!");
  }
  const userAlreadyExist = getUserByEmail(email);
  if (!userAlreadyExist) {
    return res.status(403).send("Your email hasn't registered yet!");
  } else if (userAlreadyExist) {
    console.log(userAlreadyExist.password, password);
    console.log(req.body, email, password);

    if (userAlreadyExist.password !== password) {
      return res.status(403).send("Your password is wrong!");
    } else {
      res.cookie("user_id", userAlreadyExist.id);
      res.redirect("/urls");// If the user is logged in, GET /login should redirect to GET /urls
    }
  }
  console.log("Doing POST login");

});

 app.post("/logout", (req, res) => {  
  res.clearCookie("user_id");
  res.redirect("/login");
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  let newid = Math.floor((1+Math.random()) * 0x1000000).toString(16).substring(1);
  return newid;
}