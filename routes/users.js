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
router.use(cookieSession({name: 'session',
  keys: ['key1', 'key2']}));
const {getUserWithEmail} = require('./helper_functions');
const {getFavouritesFor} = require('./helper_functions');


module.exports = (db) => {
  // Create a new user
  router.post('/register', (req, res) => {
    const user = {name: req.body.name , email: req.body.email, password: req.body.password };
    addUser(user)
    .then(user => {
      if (!user) {
        res.send({error: "error"});
        return;
      }
      req.session.userId = user.u_id;
      let templateVars = {user: user};
      res.render("index", templateVars);
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
        if (!user) {
          res.send({error: "authentification error"});
          return;
        }
        req.session.user_id = user.u_id;
        let templateVars = {user: {name: user.name, email: user.email, id: u_id}};
        res.render("index", templateVars);
      })
      .catch(e => res.send(e));
  });

  router.post('/logout', (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  router.get("/favourites", (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
      res.send({message: "not logged in"});
      return;
    }
    getFavouritesFor(user_id)
    .then(result => {
      res.send(result)
    })
  });


  return router;
};
