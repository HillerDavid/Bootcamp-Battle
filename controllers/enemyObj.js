module.exports = function Enemy(enemyName, attack, defense, hp, expValue, reference, players){
    this.enemyName = enemyName
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.expValue = expValue
    this.reference = reference
    this.players = players

    this.attackCommand = function(){
        players[0].hp += this.attack
        console.log(`${players[0].player_name}'s hp: ${players[0].hp}`)
        for(let player of players) {
            player.attacked = false
        }
        players[0].isAlive()
    }

    this.canAttack = function() {
        for(let player of players) {
            if (player.canAttack()) {
                console.log(`${player.player_name} has not attacked`)
                return false
            }
        }
        return true
    }

    this.isAlive = function(){
        return(this.hp > 0)
    }

    this.print = function() {
        let string = ''
        for(let key in this) {
            if (typeof this[key] !== 'function'){
                string += `${key}: ${this[key]}\n`
            }
        }
        return string
    }
}