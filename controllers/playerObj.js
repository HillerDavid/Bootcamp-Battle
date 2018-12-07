module.exports = function Player(playerID, playerName, attack, defense, hp, mp, currency, homeworkCompleted, exp, level){
    this.playerID = playerID
    this.playerName = playerName
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.mp = mp
    this.currency = currency
    this.homeworkCompleted = homeworkCompleted
    this.exp = exp
    this.level = level
    this.room = "home"
    
    this.isAlive = function(){
        return(this.hp < this.level * 10)
    }

    this.attack = function(enemy){
        enemy.hp -= this.attack
        enemy.isAlive()
    }
}