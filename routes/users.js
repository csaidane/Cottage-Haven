/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');
let cookieSession = require('cookie-session');
app.use(cookieSession({name: 'session',
  keys: ['key1', 'key2']}));
const {getUserWithEmail} = require('./helper_functions');
const {getUserWithId} = require('./helper_functions');


module.exports = (db) => {
  // Create a new user
  router.post('/', (req, res) => {
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, 12);
    db.addUser(user)
    .then(user => {
      if (!user) {
        res.send({error: "error"});
        return;
      }
      req.session.userId = user.id;
      res.send("🤗");
    })
    .catch(e => res.send(e));
  });

  /**
   * Check if a user exists with a given username and password
   * @param {String} email
   * @param {String} password encrypted
   */
  const login =  function(email, password) {
    return getUserWithEmail(email)
    .then(user => {
      if (password) {
        return user;
      }
      return null;
    });
  }
  exports.login = login;

  router.post('/login', (req, res) => {
    const {email, password} = req.body;
    login(email, password)
      .then(user => {
        console.log(user)
        if (!user) {
          res.send({error: "authentification error"});
          return;
        }
        req.session.user_id = user.u_id;
        let templateVars = {user: {name: user.name, email: user.email, id: userId}};
        res.render("index", templateVars);
      })
      .catch(e => res.send(e));
  });

  router.post('/logout', (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  router.get("/favourites", (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.send({message: "not logged in"});
      return;
    }
    getUserWithId(userId)
      .then(user => {
        if (!user) {
          res.send({error: "no user with that id"});
          return;
        } else{
          res.redirect("/");
        }
      })
      .catch(e => res.send(e));
  });


  return router;
};
