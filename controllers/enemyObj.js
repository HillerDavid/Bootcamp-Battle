module.exports = function Enemy(enemyName, attack, defense, hp, expValue, reference, players){
    this.enemyName = enemyName
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.expValue = expValue
    this.reference = reference
    this.players = players

    //This method is where the enemy actually fights back
    this.attackCommand = function(){
        //Pick a random player being fought to target
        let targetIndex = Math.floor(Math.random() * players.length)
        //Do damage to that player
        players[targetIndex].hp += this.attack
        console.log(`${players[targetIndex].player_name}'s hp: ${players[targetIndex].hp}`)
        //Loop through the players being fought and allow them to attack again
        for(let player of players) {
            player.attacked = false
        }
        //Check if the attacked player is still alive
        if(!players[targetIndex].isAlive()) {
            players[targetIndex].faint()
        }
    }

    //This method returns if the player can attack or not
    this.canAttack = function() {
        //Loop through the players
        for(let player of players) {
            //If one of the players fighting hasn't attacked yet wait until they have ALL attacked
            if (player.canAttack()) {
                console.log(`${player.player_name} has not attacked`)
                return false
            }
        }
        return true
    }

    //Return whether the enemy is still alive or not
    this.isAlive = function(){
        if (this.hp > 0) {
            return true
        }
        return false
    }

    //Give the players their reward and remove their reference to the enemy
    this.payout = function() {
        //Calculate how much experience each player gets
        let individualExp = this.expValue / this.players.length
        //Loop through the players
        for(let player of players) {
            //Give the player it's portion of the experience
            player.exp += individualExp
            //Reset their ability to attack
            player.attacked = false
            //Remove the reference to the enemy
            player.currentEnemy = false
        }
    }

    //Return a string of all of the properties and their values
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