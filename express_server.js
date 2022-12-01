const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

app.use(express.urlencoded({ extended: true }));

const getUserByEmail = (userEmail) => {
  for (const key in users) {
    if (users[key].email === userEmail) {
      return users[key];
    }
  }
  return null;
};

function generateRandomString() {
  let newid = Math.floor((1+Math.random()) * 0x1000000).toString(16).substring(1);
  return newid;
}

const urlsForUser = (id) => {
  const userUrl = {};
  for (const key in urlDatabase) {
    console.log("urlDatabase[key].userID", urlDatabase[key].userID);
    if (urlDatabase[key].userID === id) {
      userUrl[key] = urlDatabase[key];
    } else {
      console.log("urlDatabase[key].userID !== id");

    }
  }
  return userUrl;
};

app.get("/", (req, res) => {
  const user = users[req.cookies.user_id];
  const urls = urlsForUser(req.cookies.user_id);
  
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = { user, urls };
    res.render("urls_index", templateVars);
  }
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
  const user = users[req.cookies.user_id];

  if (!user) {
    return res.status(400).send("Please <a href='/login'> login </a> or <a href='/register'> register</a>!")
  }
  const urls = urlsForUser(req.cookies.user_id);
  const templateVars = { user, urls };
  console.log("templateVars:", templateVars)
  res.render("urls_index", templateVars);
 });
 
 //after urls_new 
 //Add POST route to expressserver.js to receive form submission
 app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console //{ longURL: 'www.google.ca' }
  //res.send("Ok. We are redirecting you to the new page you just created."); // Respond with 'Ok' (we will replace this)
  
  // the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  const user = users[req.cookies.user_id];
  const userID = req.cookies.user_id;
  console.log("userID", userID); 
  const newid = generateRandomString();
  const { longURL } = req.body;
  
  console.log("newid", newid); //
  console.log("req.body.longURL", req.body.longURL); //www.google.ca2
  console.log("longURL", longURL); //www.google.ca2
  
  if (!user) {
    res.status(400).send("Please log in first so that you can create short urls.")
  }
  urlDatabase[newid] = {  longURL, userID }; ///
  res.redirect(`/urls/${newid}`);// when it receives a POST request to /urls it responds with a redirection to /urls/:id.

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
  const longURL = urlDatabase[req.params.id].longURL;
  
  const currentUserID = req.cookies.user_id;
  const userIDOfUrl = urlDatabase[req.params.id].userID;

  
  if (!user) {
    res.status(400).send("Please <a href='/login'> login </a> or <a href='/register'> register</a>!")
  }
  if (currentUserID !== userIDOfUrl) {
    res.status(400).send("Sorry, you are not authorized to edit the url!")
  }
  const templateVars = {user, id, longURL};
  console.log("templateVars", templateVars);
  res.render("urls_show", templateVars);
//
 });

// redirect to long url
// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const id = urlDatabase[req.params.id];
  if (id) {
    res.redirect(urlDatabase[req.params.id].longURL); //urlDatabase[req.params.shortURL].longURL ///
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
  urlDatabase[id].longURL = longURL; ///
  console.log("urlDatabase[id].longURL", urlDatabase[id].longURL); ///
  console.log("longURL", longURL); 

  res.redirect(`/urls`);
});

// Add POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]; ///

  res.redirect("/urls");
});



app.post("/login", (req, res) => {  
  //const id = req.body.id;
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === '' || password === '') {
    return res.status(400).send("Email or password is invaild!");
  }
  const existedUser = getUserByEmail(email);
  if (!existedUser) {
    return res.status(403).send("Your email hasn't registered yet!");
  } else if (existedUser) {
    //console.log(req.body, email, password);
//purple-monkey-dinosaur
if (bcrypt.compareSync(password, existedUser.password)) {
  console.log(password, existedUser.password);
  res.cookie("user_id", existedUser.id);
  res.redirect("/urls");// If the user is logged in, GET /login should redirect to GET /urls
} else {
      console.log(password, existedUser.password);
      return res.status(403).send("Your password is wrong!");
      
    }
  }
  console.log("Doing POST login");
  
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

  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = {
    id, email, password
  };

  if (email === '' || password === '') {
    return res.status(400).send("Email or password is invaild, please check them.");
  }
  //
  const userAlreadyExist = getUserByEmail(email);
  if (userAlreadyExist) {
    return res.status(400).send(`User with ${email} is already registered.`)
  } else {
    const newUser = {id, email, password: hashedPassword};
    console.log(newUser);
    users[newUser.id] = newUser;
    res.cookie('user_id', newUser.id);
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

 app.post("/logout", (req, res) => {  
  res.clearCookie("user_id");
  res.redirect("/login");
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


