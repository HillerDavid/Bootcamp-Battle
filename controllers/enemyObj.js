
module.exports = function Enemy(name, attack, defense, hp, expValue, currencyValue, reference, players){

    this.name = name
    this.attack = attack
    this.defense = defense
    this.maxHp = hp
    this.hp = 0
    this.expValue = expValue
    this.currencyValue = currencyValue

    this.reference = reference
    this.players = players
    this.attackDamage

    //This method is where the enemy actually fights back
    this.attackCommand = function(){
        //Pick a random player being fought to target
        let targetIndex = Math.floor(Math.random() * this.players.length)
        let target = this.players[targetIndex]
        let defenseModifier = 0
        for(let i = 0; i < target.inventory.length; i++) {
            let item = target.inventory[i]
            if (item.equipped) {
                defenseModifier += item.effect.defense
            }
        }
        this.attackDamage = ((Math.floor(Math.random() * 6) + 1) + this.attack) - (target.defense + defenseModifier)
        if (this.attackDamage < 1) {
            this.attackDamage = 0
        }
        //Do damage to that player
        target.hp += this.attackDamage
        console.log(`${target.name}'s hp: ${target.hp}`)

        //Check if the attacked player is still alive
        let alive = target.isAlive()

        //Loop through the players being fought and allow them to attack again
        for(let player of this.players) {
            player.socket.emit('command-response', {message: `${this.name} attacks...`, alertType: 'danger'})
            player.socket.emit('command-response', {message: `${this.name} hits ${target.name} for ${this.attackDamage}`, alertType: 'danger'})
            player.attacked = false
            if (!player.hiddenNumber === target.hiddenNumber && !alive) {
                player.socket.emit('command-response', {message: `${target.name} fainted`, alertType: 'danger'})
            }
        }
        
        if(!alive) {
            this.players.splice(targetIndex, 1)
        }
    }

    //This method returns if the player can attack or not
    this.canAttack = function() {
        //Loop through the players
        for(let player of this.players) {
            //If one of the players fighting hasn't attacked yet wait until they have ALL attacked
            if (player.canAttack()) {
                console.log(`${player.name} has not attacked`)
                return false
            }
        }
        return true
    }

    //Return whether the enemy is still alive or not
    this.isAlive = function(){
        let alive = (this.hp < this.maxHp)
        if (alive) {
            if (this.canAttack()) {
                this.attackCommand()
            }
        } else {
            for(let player of this.players) {
                player.socket.emit('command-response', {message: `${this.name} has be completed`, alertType: 'success'})
                this.payout()
            }
        }
        return alive
    }

    //Give the players their reward and remove their reference to the enemy
    this.payout = function() {
        //Calculate how much experience each player gets

        let individualExp = Math.floor(this.expValue / this.players.length)
        let individualCurrency = Math.floor(this.currencyValue / this.players.length)

        //Loop through the players
        for(let player of this.players) {
            //Give the player it's portion of the experience
            player.exp += individualExp


            player.currency += individualCurrency

            player.socket.emit('command-response', {message: `${player.name} recieved ${individualExp} exp and ${individualCurrency} nerd cred!`, alertType: 'success'})

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