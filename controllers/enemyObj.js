module.exports = function Enemy(enemyName, attack, defense, hp, expValue, reference, players){
    this.enemyName = enemyName
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.expValue = expValue
    this.reference = reference
    this.players = players
    
    this.isAlive = function(){
        return(this.hp > 0)
    }

    this.attack = function(){
        players[0].hp += this.attack
        console.log(players[0].hp)
        players[0].isAlive()
    }
}