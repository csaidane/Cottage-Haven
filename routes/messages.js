"use strict";

//Boilerplate used from Tweeter project with modifications (removal of random user generation)

const express       = require('express');
const messagesRoutes  = express.Router();
const {getMessages} = require('./helper_functions');
let cookieSession = require('cookie-session');
router.use(cookieSession({name: 'session',
  keys: ['key1', 'key2']}));


//WHERE IS DATAHELPERS USED IN ANOTHER FILE??? WHAT IS A DATAHELPER - CALLBACK?? WHERE IS IT COMING FROM??
module.exports = function() {

  const getUserMessages =  function(userId) {
    return getMessages(userId)
    .then(message => {
     return messages
    });
  }
  exports.getUserMessages = getUserMessages;

  //If user clicks on messages in nav, this redirects user to messages page where they can see messages they've received
  messagesRoutes.get("/messages", function(req, res) {
    const userId = req.session.user_id;
    return getUserMessages(userId)
    .then((messages => {
      console.log(userId)
      if (messages.length === 0) {
        res.send({error: "No messages to show"});
        return;
      }
      res.render('messages_index', messages);

    })
    .catch(e => res.send(e)));

  });

  //Allows user to send messages - body of function needs to be updated
  messagesRoutes.post("/messages", function(req, res) {
    //user name (user_id) selected from drop down in compose message form becomes sender_id

    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }

    const user = req.body.user
    const message = {
      user: user,
      content: {
        text: req.body.text
      },
      created_at: Date.now()
    };

    DataHelpers.saveMessage(message, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).send();
      }
    });
  });

  return messagesRoutes;

}
