const express = require('express');
const {pool, io} = require('../app');
const router = express.Router();


const CardContainer = require('./cardContainer');
const UserContainer = require('./userContainer');
const RoomContainer = require('./roomContainer');
const QueueContainer = require('./queue');

/* on cards */
var Summon = require('./summon');
var CardTamplate = require('./cardTamplate');
/* on decks */
var Card = require('./card');
/* on users */
var Deck = require('./deck');
var User = require('./user');
/* on rooms */
var Room = require('./room');

/* end pre load files */
var LoadCards = require('./doCards');
LoadCards = new LoadCards(CardContainer);
console.log("card Loadet")

router.route('/home')
.get((request, res) => {
    if (!request.session.loggedin) res.redirect('/auth');
    else {
        res.render('home', {userID: request.session.player});

        io.on('connection', (socket) => {
            console.log('New user connection');
            // socket.playerName = socket.request.session.player;
            console.log('socket.playerName, ', socket.playerName);

            socket.on('new user', () => {
                // console.log('Socket Name: ', socket.request.session.player);
                // socket.playerName = socket.request.session.player;
                // var newUser = new User(socket.request.session.login, socket);
                // UserContainer.adduser(newUser);
                if(socket.playerName){
                    //socket.emit('new user',{status: false, text: "do allready have a player"});
                    console.log({status: false, text: "do allready have a player"});
                } else if (socket.request.session.login == "" || UserContainer.finduser(socket.request.session.login) !== null) {
                    //socket.emit('new user',{status: false, text: "the name allready in use"});
                    console.log({status: false, text: "the name allready in use"});
                } else{
                    console.log("new user: "+ socket.request.session.login);
                    socket.playerName = socket.request.session.login;
                    var newUser = new User(socket.request.session.login, socket);
                    UserContainer.adduser(newUser);
                    //socket.emit('new user',{status: true, text: "done!"});
                    console.log({status: true, text: "done!"});
                }
            });
        
            socket.on('toQueue', function (deckName, callback) {
                var userData = UserContainer.finduser(socket.playerName);
                var userDeck = userData.findDeck(deckName);
                console.log("user: "+userData.name +" deck: "+ userDeck.name);
                QueueContainer.adduser(userData, userDeck);
                callback({status:true});
                console.log("new queue : "+ userData.name);
              });
              /* show cards page*/
              socket.on('cards screen', function (callback){
                callback({status:true, items: CardContainer.htmlList});
                console.log("send card list");
              });
              socket.on('deck screen', function (callback){
                if(socket.playerName){
                  var userData = UserContainer.finduser(socket.playerName);
                  var deckArrayNames = new Array();
                  for (var i = 0; i < userData.deckList.length; i++) {
                    deckArrayNames.push(userData.deckList[i].name);
                  };
                  callback({status:true, items: deckArrayNames});
                }else{
                  callback({status:false, items: null});
                }
                //console.log("send card list");
              });
              socket.on('CreaterandomDeck', function (callback){
                if (socket.playerName) {
                  var userData = UserContainer.finduser(socket.playerName);
                  var randomNewDeck = CardContainer.createRandomDeck("randomNewDeck"+userData.deckList.length);
                  userData.addDeck(randomNewDeck);
                  callback({status:true});
                }
              });
              socket.on('getDeckCards', function (deckName, callback){
                if (socket.playerName) {
                  var userData = UserContainer.finduser(socket.playerName);
                  var userDeck = userData.findDeck(deckName);
                  callback({status:true, items: userDeck.htmlOutput()})
                }
              });
              /* the game */
              socket.on('nextTurn', function (callback){
                if (socket.playerName) {
                  var playerRoom = RoomContainer.findroom(socket.playerName);
                  if (playerRoom.endturn(socket.playerName)) {
                    callback({status:true});
                  }else{
                    callback({status:false});
                  }
                }
              });
              socket.on('activeCard', function (cardId, callback){
                if (socket.playerName) {
                  var playerRoom = RoomContainer.findroom(socket.playerName);
                  if (playerRoom.activeCard(socket.playerName, cardId)) {
                    callback({status:true});
                  }else{
                    callback({status:false});
                  }
                }
              });
              socket.on('useCard', function (cardId, enemyCardId, callback){
                if (socket.playerName) {
                  var playerRoom = RoomContainer.findroom(socket.playerName);
                  if (playerRoom.useCard(socket.playerName, cardId, enemyCardId)) {
                    callback({status:true});
                  }else{
                    callback({status:false});
                  }
                }
              });
              socket.on('useCardOnPlayer', function (cardId, callback) {
                if (socket.playerName) {
                  var playerRoom = RoomContainer.findroom(socket.playerName);
                  if (playerRoom.useCardOnPlayer(socket.playerName, cardId)) {
                    callback({status:true});
                  }else{
                    callback({status:false});
                  }
                }
              });
              socket.on('disconnect', function(){
                if (socket.playerName) {
                  console.log('user disconnected: '+dcUser);
                  var dcUser = socket.playerName;
                  var userRoom = RoomContainer.findroom(dcUser);
                  if (userRoom != null) {
                    userRoom.playerQuit(dcUser);
                  };
                  UserContainer.removeuser(dcUser);
                }
              });
        });
    }
});

console.log("cards in container: "+CardContainer.cardList.length);
/* loop */
var theQueueLoop = setInterval(function () {
var queueUsers = QueueContainer.userList; 
    for (var i = 0; i < queueUsers.length; i++) {

        if(i % 2 == 1){
        console.log("---new room---");
        var newRoom = new Room(queueUsers[i-1].user, queueUsers[i].user, queueUsers[i-1].deck, queueUsers[i].deck)
        QueueContainer.removeuser(queueUsers[i].user.name);
        QueueContainer.removeuser(queueUsers[i-1].user.name);
        RoomContainer.addroom(newRoom);
        newRoom.player1.socket.emit('gameStart');
        newRoom.player2.socket.emit('gameStart');
        newRoom.updateGame();
        console.log("a game started");
        }
    };
}, 2000);

module.exports = router;