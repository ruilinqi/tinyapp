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

  //Display the Username
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
 });
 
 //Add POST route to expressserver.js to receive form submission
 app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok. We are redirecting you to the new page you just created."); // Respond with 'Ok' (we will replace this)
  
  // the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  const newid = generateRandomString();
  const longURL = req.body;
  urlDatabase[newid] = { longURL, newid};

  // when it receives a POST request to /urls it responds with a redirection to /urls/:id.
  res.redirect("/urls/:id");
});

 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
 });

 app.get("/urls/:id", (req, res) => {
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  const user = users[req.cookie.user_id];
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];

  const templateVars = {user, id, longURL};

  res.render("urls_show", templateVars);
 });


// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  //const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  //res.render("urls_show", templateVars);
  // const id = req.params.id;
  // const longURL = req.body.longURL;
  // urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
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

  if (!email || !password) {
    return res.status(400).send("Email or password is invaild, please check them.");
  }
  //
  const userAlreadyExist = getUserByEmail(email);
  if (userAlreadyExist) {
    return res.status(400).send("User with ${email} is already exist.")
  } else {
    users[user.id] = user;
    res.cookie('user_id', user.id);
    res.redirect("/urls"); // Redirect the user to the /urls page.
  }
  console.log("Doing POST register")
});

app.post("/login", (req, res) => {  
  // const username = req.body.username;
  // res.cookie("user_id:", user_id);
  // res.redirect("/urls");
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password ) {
    return res.status(400).send("Email or password is empty!");
  }
//
});

 app.post("/logout", (req, res) => {  
  //const username = req.body.username;
  res.clearCookie("user_id");
  res.redirect("/urls");
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  let newid = Math.floor((1+Math.random()) * 0x1000000).toString(16).substring(1);
  return newid;
}