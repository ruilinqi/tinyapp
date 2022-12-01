
// take in the user's email and users database as parameters
const getUserByEmail = (userEmail, usersDatabase) => {
  for (const key in usersDatabase) {
    if (usersDatabase[key].email === userEmail) {
      return usersDatabase[key];
    }
  }
  return undefined;
};




module.exports = { getUserByEmail };