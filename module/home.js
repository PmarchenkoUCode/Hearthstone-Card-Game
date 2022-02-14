import SocketClientWorker from './socket.js';

document.addEventListener('DOMContentLoaded', () => {
    let activeCardId = null;

	SocketClientWorker.socket.on('gameStart', function () {
		cleanNewGame();
	});
	SocketClientWorker.socket.on('updateGame', function(data){
		updateGame(data);
	});
	SocketClientWorker.socket.on('gameEnd', function (youWon) {
		gameEnd(youWon);
	})
    document.getElementById('menu').style.display = 'block';

    // JS
    SocketClientWorker.socket.emit("new user");
    document.querySelectorAll('#menu .items').forEach((button) => {
        button.addEventListener('click', () => {
            var buttomText = button.textContent;
            if (buttomText == 'play') {
				console.log('PLAY');
                showDecksPage(true);
            } else if (buttomText == 'deck') {
				console.log('DECK');
                showDecksPage();
            } else if (buttomText == 'cards') {
				console.log('DECK');
                showDecksPage();
            } else {
                console.log('No');
            }
        });
    });

    document.querySelectorAll('body .backToMenu').forEach((buttom) => {
        buttom.addEventListener('click', () => {
            showpage("menu");
        })
    });

    document.querySelector('#decks #CreaterandomDeck').addEventListener('click', () => {
        SocketClientWorker.socket.emit('CreaterandomDeck', (data) => {
            if (data.status) {
                showDecksPage();
            } else {
                console.log('не удалось создать случайную колоду');
            }
        });
    });

    document.querySelector('#gameDecks').addEventListener('click', () => {
        document.querySelectorAll('.deck').forEach((deck) => {
            var deckname = deck.getAttribute('deckname');
            if (deckname != 'emty') {
                SocketClientWorker.socket.emit('getDeckCards', deckname, (data) => {
                    if (data.status) {
                        showCardsPage(data.items);
                    } else {
                        console.log('Не удалось создатьь случайную колоду');
                    }
                });
            } else {
                console.log('Нет колоды');
            }
        });
    });

    document.querySelector('#play').addEventListener('click', () => {
        var deckname = document.querySelector('.deck').getAttribute("deckname");
        if (deckname != "emty") {
            SocketClientWorker.socket.emit('toQueue', deckname, function(data){
                if (data.status) {
                    showpage("queue");
                    console.log("add you to gueue");
                } else {
                    console.log("fail add you to gueue");
                }
            });
        } else {
            console.log("not a deck");
        }
    });

    document.querySelector('#theBoard #nextTurn').addEventListener('click', () => {
        SocketClientWorker.socket.emit('nextTurn', (data) => {
            activeCardId = null;
            if (data.status) {
                console.log('Следующий ход');
            } else {
                console.log('Не твоя очередь ходить');
            }
        });
    });

	// document.querySelector('#myHand .card').addEventListener('click', () => {
	// 	var cardId = card.getAttribute('cardId');
	// 	socket.emit('activeCard', cardId, (data) => {
	// 		if (data.status) {
	// 			console.log('Следующий ход');
	// 		} else {
	// 			console.log('Не твоя очередь ходить');
	// 		}
	// 	});
	// });

    document.querySelector('#myHand').addEventListener('click', () => {
        document.querySelectorAll('.card').forEach((card) => {
            var cardId = card.getAttribute('cardId');
            SocketClientWorker.socket.emit('activeCard', cardId, (data) => {
                if (data.status) {
                    console.log('Следующий ход');
                } else {
                    console.log('Не твоя очередь ходить');
                }
            });
        })
    });

    document.querySelector('#myTeam').addEventListener('click', () => {
        document.querySelectorAll('.card').forEach((card) => {
            if (card.getAttribute('charge') == 'true') {
                activeCardId = card.getAttribute('cardId');
                console.log('выбрана карта:' + activeCardId);
            } else {
                console.log('карта не снимается');
            }
        });
    });

    document.querySelector('#enemyTeam').addEventListener('click', () => {
        document.querySelectorAll('.card').forEach((card) => {
            if (activeCardId != null) {
                var cardId = card.getAttribute('cardId');
                SocketClientWorker.socket.emit('useCard', activeCardId, cardId, (data) => {
                    if (data.status) {
                        activeCardId = null;
                        console.log('Шаг сделан');
                    } else {
                        console.log('Что-то не так на стороне сервера');
                    }
                });
            } else {
                console.log('Выберите карту для атаки!');
            }
        });
    });

    document.querySelector('#enemyPlayer').addEventListener('click', () => {
        if (activeCardId != null) {
            SocketClientWorker.socket.emit('useCardOnPlayer', activeCardId, (data) => {
                if (data.status) {
                    activeCardId = null;
                    console.log('ход сделан на игроке');
                } else {
                    console.log('что-то пошло не так на стороне сервера');
                }
            });
        } else {
            console.log('выберите карту для атаки!');
        }
    });

	/**
	*	load and show a page
	*/
	function showCardsPage (cardArray) {
		console.log("cards screen");
		/* shows all card that is in the game*/
		if (cardArray === undefined) {
			SocketClientWorker.socket.emit('cards screen', function(data){
				console.log(data);
				if (data.status) {
					document.querySelector('#cards #gameCards').innerHTML;
					var cardsHtml = "";
					for (var i = 0; i < data.items.length; i++) {
						cardsHtml += createCardHtml(data.items[i]);
					};
					document.querySelector('#cards #gameCards').innerHTML = cardsHtml;
					showpage("cards");
				}else{
					console.log('серверная сторона пиздец');		
				}
			});
		}else{
			document.querySelector('#cards #gameCards').innerHTML;
			var cardsHtml = "";
			for (var i = 0; i < cardArray.length; i++) {
				cardsHtml += createCardHtml(cardArray[i]);
			};
			document.querySelector('#cards #gameCards').innerHTML = cardsHtml;
			showpage("cards");
		}
	}
	function showDecksPage (onPlayPage) {
		SocketClientWorker.socket.emit('deck screen', function(data){
			if (data.status) {
				if (onPlayPage !== undefined) {
					document.querySelector('#play #gameDecks').innerHTML;
				}else{
					document.querySelector('#decks #gameDecks').innerHTML;
				}
				var decksHtml = "";
				for (var i = 0; i < data.items.length; i++) {
					decksHtml += createDeckHtml(data.items[i]);
				};
				for (var i = 0; i < (9-data.items.length); i++) {
					decksHtml += createDeckHtml("emty");
				};
				if (onPlayPage !== undefined) {
					document.querySelector('#play #gameDecks').innerHTML = decksHtml;
				}else{
					document.querySelector('#decks #gameDecks').innerHTML = decksHtml;
				}
				console.log("deckHtml: "+decksHtml);
				if (onPlayPage !== undefined) {
					showpage("play");
				}else{
					showpage("decks");
				}
			}else{
				console.log("server side fuck up");		
			}
		});
	}
	function createCardHtml (data) {
		return '<div class="card" taunt="'+data.taunt+'" charge="'+data.charge+'" cardId="'+data.id+'"><div class="cardDesigh" style="background-image: url(\'/image/'+data.cardTamplate+'\'); background-size: 100%;" ><div class="attack">'+data.attack+'</div><div class="health">'+data.health+'</div><div class="cost">'+data.cost+'</div><div class="data">'+data.text+'</div></div></div>';
	}
	function createDeckHtml (data) {
		return '<div class="deck" deckName="'+data+'">'+data+'</div>';
	}
	function showpage (page) {
		document.getElementById('theBoard').style.display = 'none';
		document.getElementById('menu').style.display = 'none';
		document.getElementById('cards').style.display = 'none';
		document.getElementById('decks').style.display = 'none';
		document.getElementById('play').style.display = 'none';
		document.getElementById('queue').style.display = 'none';
		document.getElementById('gameEnd').style.display = 'none';

		if (page == 'theBoard') {
			document.getElementById('theBoard').style.display = 'block';
		} else if (page == 'cards') {
			document.getElementById('cards').style.display = 'block';
		} else if (page == 'decks') {
			document.getElementById('decks').style.display = 'block';
		} else if (page == 'play') {
			document.getElementById('play').style.display = 'block';
		} else if (page == 'queue') {
			document.getElementById('queue').style.display = 'block';
		} else if (page == 'gameEnd') {
			document.getElementById('gameEnd').style.display = 'block';
		} else {
			document.getElementById('menu').style.display = 'block';
		}
	}
	/* the game data */
	function cleanNewGame() {
		document.querySelector('#theBoard #enemyHand').innerHTML;
		document.querySelector('#theBoard #theMap #enemyTeam').innerHTML;
		document.querySelector('#theBoard #theMap #myTeam').innerHTML;
		document.querySelector('#theBoard #myHand').innerHTML;
		showpage("theBoard");
	}

    function updateGame(data) {
        console.log(data);

        document.querySelector('#theBoard #enemyHand').innerHTML;
		document.querySelector('#theBoard #theMap #enemyTeam').innerHTML;
		document.querySelector('#theBoard #theMap #myTeam').innerHTML;
		document.querySelector('#theBoard #myHand').innerHTML;

        var enemyHand = "";
        for (var i = 0; i < data.enemyHand; i++) {
            enemyHand += '<div class="card backcard">a</div>';
        };
        document.querySelector('#theBoard #enemyHand').innerHTML = enemyHand;

        var myHand = "";
        for (var i = 0; i < data.myHand.length; i++) {
            myHand += createCardHtml(data.myHand[i]);
        };
        document.querySelector('#theBoard #myHand').innerHTML = myHand;

        var enemyTeam = "";
        for (var i = 0; i < data.enemyTable.length; i++) {
            enemyTeam += createCardHtml(data.enemyTable[i].Card, true);
        };
        document.querySelector('#theBoard #theMap #enemyTeam').innerHTML = enemyTeam;

        var myTeam = "";
		for (var i = 0; i < data.myTable.length; i++) {
			myTeam += createCardHtml(data.myTable[i].Card);
		};
        document.querySelector('#theBoard #theMap #myTeam').innerHTML = myTeam;
        document.querySelector('#theBoard #enemygems').innerHTML = data.enemy.gemsLeft+" / 10";
        document.querySelector('#theBoard #mygems').innerHTML = (data.gemsLeft+" / 10");
        document.querySelector('#theBoard #info').innerHTML = "turn: "+ data.turn+ "<br>turns: "+ data.turns+ "<br>my live: "+ data.myLife+ "<br>cards Left: "+ data.cardsLeft;
        document.querySelector('#theBoard #enemyPlayer').innerHTML = data.enemyLife;
    }

    function gameEnd(youWon) {
        if (youWon) {
            document.querySelector('#gameEnd .items').innerHTML = "you won the game!!";
        } else {
            document.querySelector('#gameEnd .items').innerHTML = "you lost the game!!";
        }

        cleanNewGame();
		showpage("gameEnd");
    }
});