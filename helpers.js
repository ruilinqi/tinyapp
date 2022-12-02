const bcrypt = require("bcryptjs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

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

// take in the user's email and users database as parameters
const getUserByEmail = (userEmail, usersDatabase) => {
  for (const key in usersDatabase) {
    if (usersDatabase[key].email === userEmail) {
      return usersDatabase[key];
    }
  }
  return undefined;
};


function generateRandomString() {
  let newid = Math.floor((1+Math.random()) * 0x1000000).toString(16).substring(1);
  return newid;
}

const urlsForUser = (id, urlDatabase) => {
  const userUrl = {};
  for (const key in urlDatabase) {
    // console.log("urlDatabase[key].userID", urlDatabase[key].userID);
    // console.log(userUrl[key]);
    // console.log(urlDatabase[key]);
    if (urlDatabase[key].userID === id) {
      userUrl[key] = urlDatabase[key];
    } else {
      //console.log("urlDatabase[key].userID !== id");
    }
  }
  return userUrl;
};


module.exports = { users, urlDatabase, getUserByEmail, generateRandomString, urlsForUser };