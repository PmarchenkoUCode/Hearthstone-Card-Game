var CardContainer = require('./cardContainer');
var Summon = require('./summon.js');
module.exports = function (name, cardTamplate, cardImage, text, attack, health, cost, charge, summon, taunt) {
	console.log('File - "Card.js" CardContainer List', CardContainer.cardList.length);
	this.id = CardContainer.cardList.length;
	this.name = name;
	this.cardTamplate = cardTamplate;
	this.cardImage = cardImage;
	this.text = text;
	this.attack = attack;
	this.health = health;
	this.cost = cost;
	this.charge = charge;
	if(summon == null){
		this.summon = null;
	}else{
		this.summon = new Summon(CardContainer.findCard(summon[0]), summon[1]);
	}
	this.taunt = taunt;
	this.printInfo = function(){
		return 	"id: " + this.id + "\n"+
				"name: " + this.name + "\n"+
				"cardTamplate: " + this.cardTamplate + "\n"+
				"text: " + this.text + "\n"+
				"attack: " + this.attack + "\n"+
				"health: " + this.health + "\n"+
				"cost: " + this.cost + "\n"+
				"charge: " + this.charge + "\n"+
				"summon: " + this.summon + "\n"+
				"taunt: " + this.taunt + "\n";
	}
	this.htmlOutput = function(){
		return {id: this.id, name: this.name, attack: this.attack, health: this.health, cost: this.cost, text: this.text, charge: this.charge, taunt: this.taunt, cardTamplate: this.cardTamplate, cardImage: this.cardImage};
	}
}
