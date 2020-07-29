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
      req.session.user_name = user.name;
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
        res.send({error: "error cannot insert into favourites"});
        return;
      }
      let templateVars = {user: {name: req.session.user_name, id: req.session.user_id}};
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
    console.log("We are here:", email, password);
    login(email, password)
      .then(users => {
        const user = users[0]
        if (!user) {
          res.send({error: "authentification error"});
          return;
        }
        req.session.user_id = user.u_id;
        req.session.user_name = user.name;
        let templateVars = {user: {name: user.name, id: user.u_id}};
        res.render("index", templateVars);
      })
      .catch(e => res.send(e));
  });

  router.post('/logout', (req, res) => {
    req.session = null;
    let templateVars = {user:null}
    res.render("login", templateVars);
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
      templateVars = {user: {name: req.session.user_name, id: req.session.user_id}};
    } else{
      templateVars = {user:null}
    }
    res.render("login",templateVars);
  });

  router.get("/register", (req, res) => {
    let templateVars = {};
    if(req.session.user_id){
      templateVars = {user: {name: req.session.user_name, id: req.session.user_id}};
    } else{
      templateVars = {user:null}
    }
    res.render("register",templateVars);
  });


  router.get("/properties", (req,res)=> {
    let templateVars = {};
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
      .then((properties) =>{
        if(!properties){
          res.send({error: "this admin does not own any property"});
          return;
        }
        templateVars['properties'] = properties;
        templateVars['user'] ={name: req.session.user_name, id: req.session.user_id};
        res.render('my_listings',templateVars)
      })
      .catch(e => res.send(e));
    }
  });


  // placeholder routes for testing markup (to be deleted after testing)
  router.get("/property-profile", (req, res) => {
    res.render("property_profile");
  });
  router.get("/create-listing", (req, res) => {
    res.render("create_listing");
  });
  router.get("/faves", (req, res) => {
    res.render("favourites");
  });
  //

  return router;
};
