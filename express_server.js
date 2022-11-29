const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));


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
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
 });

 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
 });

 app.get("/urls/:id", (req, res) => {
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
 });

 app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});