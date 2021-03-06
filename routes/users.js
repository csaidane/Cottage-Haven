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
const {addUser} = require('./helper_functions');
const {getAdminWithId} = require('./helper_functions');
const {getPropertiesForId} = require('./helper_functions');
const {delFromFavourites} = require('./helper_functions');
const {delFromProperties} = require('./helper_functions');
const {SetAsSold} = require('./helper_functions');
const {addProperty} = require('./helper_functions');
const {getAllProperties} = require('./helper_functions');
const {getPropertyById} = require('./helper_functions');








module.exports = (db) => {
  //--Tested,all good--
  //Load the register page --Tested,all good--
  router.get("/register", (req, res) => {
    let templateVars = {};
    if(req.session.user_id){
      templateVars = {user: {name: req.session.user_name, id: req.session.user_id}};
    } else{
      templateVars = {user:null}
    }
    res.render("register",templateVars);
  });
  //--Tested,all good--
  // Register a new user
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
  //--Tested,all good--
  //Load the login page
  router.get("/login", (req, res) => {
    let templateVars = {};
    if(req.session.user_id){
      templateVars = {user: {name: req.session.user_name, id: req.session.user_id}};
    } else{
      templateVars = {user:null}
    }
    res.render("login",templateVars);
  });

  //Helper function checks if a user exists with a given username and password
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
  //--Tested,all good--
  //This POST route logs in a user by checking his credentials against the db and cookie-ing the browser
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
  //POST for logout, undoes previous cookies
  router.post('/logout', (req, res) => {
    req.session = null;
    let templateVars = {user:null}
    res.render("login", templateVars);
  });

  //Good for now
  //Renders a user's favourite properties
  router.get("/favourites", (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
      res.send({message: "not logged in"});
      return;
    }
    getFavouritesFor(user_id)
    .then(result => {
      let templateVars = {favourites:result, user: {name: req.session.user_name, id: req.session.user_id}};
      console.log(templateVars)
      res.render("favourites", templateVars);
    })
  });
  //Works, all good
  //POST for adding a property to the table of favourites (for a specific user)
  router.post('/add/favourite', (req, res) => {
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
      res.redirect("/api/users/favourites");
    })
    .catch(e => res.send(e));
  });
  //Works, all good
  //Undoes previous route
  router.post('/del/favourite', (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
      res.send({message: "not logged in"});
      return;
    }
    const property = req.body.property;
    delFromFavourites(user_id,property)
    .then(property => {
      if (!property) {
        res.send({error: "error cannot delete"});
        return;
      }
      res.redirect("/api/users/favourites");
    })
    .catch(e => res.send(e));
  });

  router.post('/gallery', (req,res)=>{
    let templateVars = {};
    const user_id = req.session.user_id;
    if (!user_id) {
      res.send({message: "not logged in"});
      return;
    }
    let min = req.body.minimum_price;
    let max = req.body.maximum_price;
    getAllProperties(min,max)
    .then((properties) =>{
      if(!properties){
        res.send("error");
        return;
      }
      templateVars['properties'] = properties;
      templateVars['user'] ={name: req.session.user_name, id: req.session.user_id};
      console.log(templateVars)
      res.render('feed',templateVars)
    })
    .catch(e => res.send(e));
  });


  //Renders all of the properties belonging to a given user, if he owns any
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


    //Load the create_listings page
    router.get("/create_listing", (req, res) => {
      let templateVars = {};
      if(req.session.user_id){
        templateVars = {user: {name: req.session.user_name, id: req.session.user_id}};
      } else{
        templateVars = {user:null}
      }
      res.render("create_listing",templateVars);
    });

  //Adding property
  router.post('/add/property', (req, res)=>{
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
          console.log(req.body)
          let property = {owner_id:req.session.user_id,
            title:req.body.title,
            description:req.body.description,
            photo_url_1:req.body.photo_url_1,
            photo_url_2:req.body.photo_url_2,
            photo_url_3:req.body.photo_url_3,
            photo_url_4:req.body.photo_url_4,
            photo_url_5:req.body.photo_url_5,
            price:req.body.price,
            parking_spaces:req.body.parking_spaces,
            number_of_bathrooms:req.body.number_of_bathrooms,
            number_of_bedrooms:req.body.number_of_bedrooms,
            street:req.body.street,
            city:req.body.city,
            province:req.body.province,
            post_code:req.body.post_code,
            sold:false};
          return addProperty(property)
        }
      })
      .then((properties) =>{
        if(!properties){
          res.send({error: "error: failed to add property"});
          return;
        }
        res.redirect("/api/users/properties");
      })
      .catch(e => res.send(e));
    }
  });

  //Deleting a given property
  router.post('/del/property', (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
      res.send({message: "not logged in"});
      return;
    } else{
      getAdminWithId(user_id)
      .then(admin => {
        if (!admin) {
          res.send({error: "this person is not an admin !"});
          return;
        } else{
          const property_id = req.body.property;
          return delFromProperties(property_id)
        }
      })
      .then(property => {
        if (!property) {
          res.send({error: "error cannot delete"});
          return;
        }
        res.redirect("/api/users/properties");
      })
    }
  });

  //Marks a property as SOLD.
  router.post('/sold/property', (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
      res.send({message: "not logged in"});
      return;
    }
    const property_id = req.body.properties;
    SetAsSold(property_id)
    .then(property => {
      if (!property) {
        res.send({error: "error cannot update"});
        return;
      }
      res.redirect("/api/users/properties");
    })
  });


  //GET for returning a specific property information
  router.get("/property-profile/:id", (req, res) => {
    let property_id = req.params.id;
    getPropertyById(property_id)
    .then((property)=>{
      if(req.session.user_id){
        templateVars = {property:property, user: {name: req.session.user_name, id: req.session.user_id}};
      } else{
        templateVars = {property:property, user:null}
      }
      res.render("property_profile",templateVars);
    })
  });

  //Testing routes
  router.get("/create-listing", (req, res) => {
    res.render("create_listing");
  });
  router.get("/faves", (req, res) => {
    res.render("favourites");
  });
  router.get("/edit-listing", (req, res) => {
    res.render("edit_listing");
  });
  //



  return router;
};
