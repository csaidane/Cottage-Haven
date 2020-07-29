"use strict";

//Boilerplate used from Tweeter project with modifications (removal of random user generation)

const express       = require('express');
const messagesRoutes  = express.Router();
const {getMessages} = require('./helper_functions');
const {sendMessage} = require('./helper_functions');
const {getAllUsers} = require('./helper_functions');
let cookieSession = require('cookie-session');
messagesRoutes.use(cookieSession({name: 'session',
  keys: ['key1', 'key2']}));



module.exports = function() {

  const getUserMessages =  function(userId) {
    return getMessages(userId)
    .then(message => {
     return message;
    });
  }
  exports.getUserMessages = getUserMessages;

  //If user clicks on messages in nav, this redirects user to messages page where they can see messages they've received. It also pulls all users into the compose message form in the "to" drop down menu to select a receiver.
  messagesRoutes.get("/notes", function(req, res) {
    const userId = req.session.user_id;
    console.log("USERID:", userId);
    const username = req.session.user_name;
    console.log("USERNAME:", username);
    return getUserMessages(userId)
    .then((messages => {
      const allUsers = getAllUsers(userId); //this may need a .then(data) and return data
      console.log(userId)
      if (messages.length === 0) {
        res.send({error: "No messages to show"});
        return;
      }
      console.log("We are here");
      res.render('messages_index', {messages : messages, user : {name : username, id : userId}}); //add this in curly braces to every page that has a header or else header will fail - can also add as a templateVars

    }))
    .catch(e => res.send(e));

  });




  //Allows user to send messages to the database and redirects user to message sent confirmation page
  messagesRoutes.post("/notes", function(req, res) {
    //user name (user_id) selected from drop down in compose message form becomes receiver_id - front end

    const fullMessage = {sender_id : req.session.user_id, content : req.body.content, receiver_id : req.body.receiver_id}; //these .names have to be the same on the front end so that selected username can be converted to receiver_id <select name="receiver_id"><option>NAME</option><select> <--- add to front end
    sendMessage(fullMessage)
    .then(message => {
      if (!message) {
        res.send({error: "No message sent"});
        return;
      }
      res.render('sent_confirm');
    })
    .catch(e => res.send(e));

  });

  return messagesRoutes;



}
