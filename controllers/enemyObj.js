
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
    this.effects = []

    //This method is where the enemy actually fights back
    this.attackCommand = function(){
        this.update()
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
        let alive = target.isAlive(true)

        //Loop through the players being fought and allow them to attack again
        for(let player of this.players) {
            player.socket.emit('command-response', {message: `${this.name} attacks...`, alertType: 'danger'})
            player.socket.emit('command-response', {message: `${this.name} hits ${target.name} for ${this.attackDamage}`, alertType: 'danger'})
            player.attacked = false
            if (!player.hiddenNumber === target.hiddenNumber && !alive) {
                player.socket.emit('command-response', {message: `${target.name} fainted`, alertType: 'danger'})
            }
        }

        target.isAlive()
        
        if(!alive) {
            this.players.splice(targetIndex, 1)
        }
    }

    //This method returns if the player can attack or not
    this.canAttack = function() {
        //Loop through the players
        for(let player of this.players) {
            //If one of the players fighting hasn't attacked yet wait until they have ALL attacked
            if (player.canAttack(false)) {
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
                player.socket.emit('command-response', {message: `${this.name} has been completed`, alertType: 'success'})
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

            player.socket.emit('command-response', {message: `${player.name} received ${individualExp} exp and ${individualCurrency} nerd cred!`, alertType: 'success'})

            //Reset their ability to attack
            player.attacked = false
            //Remove the reference to the enemy
            player.currentEnemy = false
            
            player.levelUp()
            player.removeEffects()
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

    this.relayEffect = function(descriptor, value, effectName, isGood) {
        let message = `${this.name} is ${descriptor} ${value} by ${effectName}`
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].socket.emit('command-response', { message, alertType: isGood ? 'danger' : 'secondary'})
        } 
    }

    this.update = function() {
        for(let i = 0; i < this.effects.length; i++) {
            let effect = this.effects[i]
            if (effect.attack > 0) {
                this.relayEffect('strengthened', effect.attack, effect.name, true)
            } else if (effect.attack < 0) {
                this.relayEffect('weakened', effect.attack, effect.name, false)
            }
            if (effect.defense > 0) {
                this.relayEffect('protected', effect.defense, effect.name, true)
            } else if (effect.defense < 0) {
                this.relayEffect('made vulnerable', effect.defense, effect.name, true)
            }
            if (effect.hp < 0) {
                this.relayEffect('healed', effect.hp, effect.name, true)
            } else if (effect.hp > 0) {
                this.relayEffect('hit', effect.hp, effect.name, false)
            }
            if (effect.mp > 0) {
                this.relayEffect('excited', effect.mp, effect.name, true)
            } else if (effect.mp < 0) {
                this.relayEffect('discouraged', effect.mp, effect.name, false)
            }
            effect.update(this)
        }
        if (this.hp < 0) {
            this.hp = 0
        }
    }
}