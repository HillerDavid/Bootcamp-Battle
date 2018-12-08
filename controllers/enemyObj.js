module.exports = function Enemy(enemyName, attack, defense, hp, expValue, players){
    this.enemyName = enemyName;
    this.attack = attack;
    this.defense = defense;
    this.hp = hp;
    this.expValue = expValue;
    this.players = players

    this.isAlive = function(){
        return(this.hp > 0)
    }

    this.attack = function(player){
        player.hp += this.attack
        player.isAlive()
    }
}