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
const {addtoFavourites} = require('./helper_functions');
const {getUserWithId} = require('./helper_functions');
const {addUser} = require('./helper_functions');
const {getAdminWithId} = require('./helper_functions');
const {getPropertiesForId} = require('./helper_functions');



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
      req.session.user_id = user.u_id;
      let templateVars = {user: user};
      res.render("index", templateVars);
    })
    .catch(e => res.send(e));
  });

  // Create a new user
  router.post('/addFavorite', (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
      res.send({message: "not logged in"});
      return;
    }
    const property = req.body.property;
    addtoFavourites(user_id,property)
    .then(property => {
      if (!property) {
        res.send({error: "error"});
        return;
      }
    })
    .then(() =>{
      getUserWithId(user_id);
    })
    .then( user => {
      let templateVars = {user: {name: user.name, email: user.email, id: u_id}};
      res.render("favourites", templateVars);
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
        let templateVars = {user: {name: user.name, email: user.email, id: user.u_id}};
        res.render("index", templateVars);
      })
      .catch(e => res.send(e));
  });

  router.post('/logout', (req, res) => {
    req.session = null;
     let templateVars = {user:null}
    res.render("login",templateVars);
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


  router.get("/login", (req, res) => {
    let templateVars = {};
    if(req.session.user_id){
      let user_id = req.session.user_id;
      getUserWithId(user_id)
    .then( user => {
      templateVars = {user: {name: user.name, email: user.email, id: user.u_id}};
      res.render("favourites", templateVars);
      })
    } else{
      templateVars = {user:null}
    }
    res.render("login",templateVars);
  });

  return router;
};

router.get("/properties", (req,res)=> {
  if(!req.session.user_id){
    res.send('error: you are not logged in')
  } else{
    let current_id = req.session.user_id;
    getAdminWithId(current_id)
    .then(admin => {
      if (!admin) {
        res.send({error: "this person is not an admin !"});
        return;
      } else{
        return getPropertiesForId(current_id)
      }
    })
    .then(properties =>{
      if(!properties){
        res.send({error: "this admin does not own any property"});
      }
      res.send(properties)
    })
    .catch(e => res.send(e));
  }

});
