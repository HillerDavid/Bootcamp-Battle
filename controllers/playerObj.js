module.exports = function Player(player_id, player_name, attack, defense, hp, mp, currency, homework_completed, exp, level){
    this.player_id = player_id
    this.name = player_name
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.mp = mp
    this.currency = currency
    this.homework_completed = homework_completed
    this.exp = exp
    this.level = level
    this.room = 'home'
    this.socket
    this.currentEnemy
    this.attacked = false
    this.inventory = []
    this.challenges = []
    this.effects = []

    this.acceptCommand = function(modifier) {
        for(let i = this.challenges.length - 1; i >= 0; i--) {
            let player = game.players[this.challenges[i]]
            if (!player) {
                this.challenges.splice(i, 1)
                continue
            }
            if (player.name.toLowerCase() !== modifier) {
                continue
            }
            if (player.room !== 'panera') {
                this.socket.emit('command-response', {message: `${player.name} is not in panera`, alertType: 'danger'})
                return
            }
            this.currentEnemy = player
            player.currentEnemy = this
            this.socket.emit('command-response', {message: `You are now fighting ${player.name}.\nYou were challenged, so you go first.`, alertType:'success'})
            player.socket.emit('command-response', {message: `You are now fighting ${this.name}.\nYou challenged them, so they go first.`, alertType: 'success'})
            player.attacked = true
            this.challenges = []
            player.challenges = []
            return
        }
        this.socket.emit('command-response', {message: `There is no challenge from ${modifier}`})
    }
    
    //This is the method where the player actually attacks the enemy they are fighting
    this.attackCommand = function(modifier){
        if (modifier) {
            this.socket.emit('command-response'), {message: 'The attack command does not take any parameters.', alertType: 'danger'}
            return
        }
        //Check if the player can attack
        if (this.canAttack()) {
            this.update()
            this.socket.emit('command-response', {message: `${this.name} attacks...`, alertType: 'secondary'})
            let equipmentModifier = 0
            for(let i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i].equipped) {
                    equipmentModifier += this.inventory[i].effect.attack
                }
            }
            //Do damage to the enemy corresponding to the attack
            let enemyModifier = 0;
            if (this.currentEnemy.inventory) {
                for(let i = 0; i < this.currentEnemy.inventory.length; i++) {
                    let item = this.currentEnemy.inventory[i]
                    if (item.equipped) {
                        enemyModifier += item.effect.defense
                    }
                }
            }
            let damage = ((Math.floor(Math.random() * 6) + 1) + this.attack + equipmentModifier + this.level) - (this.currentEnemy.defense + enemyModifier)
            if (damage < 1) {
                damage = 0
            }
            this.socket.emit('command-response', {message: `${this.name} hits for ${damage}`, alertType: 'secondary'})
            this.currentEnemy.hp += damage
            //Store that the player has attacked already this turn
            this.attacked = true
            if (this.currentEnemy.level) {
                this.currentEnemy.attacked = false
                this.currentEnemy.socket.emit('command-response', {message: `${this.name} attacks...`, alertType: 'danger'})
                this.currentEnemy.socket.emit('command-response', {message: `${this.name} hits for ${damage}`, alertType: 'danger'})
            }
            this.currentEnemy.isAlive()
        }
    }

    this.buyCommand = function(modifier) {
        if (this.room !== 'vending machine') {
            this.socket.emit('command-response', {message: 'You can only buy at the vending machine', alertType: 'danger'})
            return
        }

        if (!modifier) {
            this.socket.emit('command-response', {message: `The buy command takes at least one parameter e.g. 'buy energy drink' or 'buy 2 energy drink'`})
            return
        }

        let quantity = parseInt(modifier.split(' ')[0])
        let itemName = modifier.split(' ').slice(1).join(' ')
        if (!isNaN(quantity)) {
            if (quantity < 0) {
                this.socket.emit('command-response', {message: 'You cannot buy an negative quantity', alertType: 'danger'})
                return
            }
        } else {
            itemName = modifier
            quantity = 1
        }

        if (!game.items[itemName]) {
            this.socket.emit('command-response', {message: `The item ${itemName} does not exist`, alertType: 'danger'})
            return
        }
        let item = game.items[itemName]

        if (this.currency >= quantity * item.cost) {
            this.currency -= quantity * item.cost
            game.methods.giveItem(this, item, quantity)
            this.socket.emit('command-response', {message: `${this.name} bought ${quantity} ${itemName}`, alertType: 'success'})
            return
        }

        this.socket.emit('command-response', {message: `${this.name} does not have enough nerd cred`, alertType: 'danger'})
    }

    //Returns if the player has the ability to attack
    this.canAttack = function() {
        //If they are in the right room, they haven't attacked yet this turn, AND are fighting an enemy they can attack
        if ((this.room === 'class' || this.room === 'panera') && !this.attacked && this.currentEnemy) {
            return true
        }
        return false
    }

    this.challengeCommand = function(modifier) {
        if (this.room !== 'panera') {
            this.socket.emit('command-response', {message: 'PvP combat must be done at Panera', alertType: 'danger'})
            return
        }
        for(let key in game.players) {
            let player = game.players[key]
            if (player.name.toLowerCase() === modifier) {
                if (player.room !== 'panera') {
                    this.socket.emit('command-response', {message: `${modifier} is not at Panera`, alertType: 'danger'})
                    return
                }
                if (player.challenges.includes(this.socket.id)) {
                    this.socket.emit('command-response', {message: `${this.name} has already challenged ${modifier}`, alertType: 'danger'})
                    return
                }
                player.socket.emit('command-response', {message: `${this.name} challenged you`, alertType: 'success'})
                player.challenges.push(this.socket.id)
                return
            }
        }
        this.socket.emit('command-response', {message: `There is no player with the name ${modifier}`, alertType: 'danger'})
    }

    //Allows the player to type in console.log and see information about their character
    this['console.logCommand'] = function() {
        let message = ''
        for(let key in this) {
            if (key === 'hiddenNumber') {
                continue
            }
            if (typeof this[key] !== 'function' && typeof this[key] !== 'object') {
                message += `${key}: ${this[key]}\n`
            }
        }
        message = message.trim()
        this.socket.emit('command-response', {message})
    }

    this.equipCommand = function(modifier) {
        for (let i = 0; i < this.inventory.length; i++) {
            let item = this.inventory[i]
            if (item.item_name === modifier) {
                let equipResponse = item.equip()
                if (!equipResponse) {
                    this.socket.emit('command-response', {message: `${this.name} equipped ${item.item_name}`})
                } else {
                    this.socket.emit('command-response', {message: equipResponse, alertType: 'danger'})
                }
                return
            }
        }
        this.socket.emit('command-response', {message: `${this.name} does not have an item called ${modifier}`, alertType: 'danger'})
    }

    this.faint = function() {
        this.currentEnemy = undefined
        this.room = 'home'
        this.hp = 0
        if (this.currency > this.level * 20) {
            this.currency -= this.level * 20
        } else {
            this.currency = 0
        }
        this.socket.emit('command-response', {message:  `The stress is too much! ${this.name} fainted.`})
        this.socket.emit('command-response', {message:  `${this.name} wakes up energized and ready to try again!`, level: this.room})
    }

    //Returns if the player is still alive
    this.isAlive = function(){
        let alive = (this.hp < this.level * 10)
        if (!alive) {
            if (this.room === 'class') {
                this.faint()
            } else {
                this.currentEnemy.socket.emit('command-response', {message: 'You won!', alertType: 'success'})
                this.currentEnemy.hp = 0
                this.currentEnemy.attacked = false
                this.currentEnemy.currentEnemy = undefined
                this.socket.emit('command-response', {message: 'You lost', alertType: 'danger'})
                this.hp = 0
                this.attacked = false
                this.currentEnemy = undefined
            }
        }
        return alive
    }

    this.levelUp = function() {
        if (this.exp >= this.level * 200) {
            this.exp -= this.level * 200
            this.level++
            this.attack++
            this.defense += 2
        }
    }

    this.moneyCommand = function() {
        this.currency += 100
    }

    //Move the player around the world
    this.moveCommand = function(room) {
        //Define the available areas
        let rooms = ['home', 'panera', 'class', 'vending machine']
        if (this.currentEnemy) {
            this.socket.emit('command-response', {message: `${this.name} cannot move to a different area during a fight`, alertType: 'danger'})
            return
        }
        if (!rooms.includes(room)) {
            this.socket.emit('command-response', {message: `${room} is not a valid location `, alertType: 'danger'})
            return
        }
        if (this.room === room) {
            this.socket.emit('command-response', {message: `${this.name} is already in ${room}`, alertType: 'danger'})
            return
        }
        //Move them to the room they are trying to access
        this.room = room
        this.socket.emit('command-response', {message: `${this.name} moved to ${this.room}`, level: this.room})
        if (this.room === 'class') {
            if (this.homework_completed < 1) {
                game.methods.createEnemy([this])
                this.socket.emit('command-response', {message: `${this.name} has been given a(n) ${this.currentEnemy.name}`, alertType: 'danger'})
            }
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

    //Heal the user if they are able to sleep
    this.sleepCommand = function() {
        if (this.room === 'home') {
            this.hp = 0
            return true
        }
        return false
    }

    this.unequipCommand = function(modifier) {
        for (let i = 0; i < this.inventory.length; i++) {
            let item = this.inventory[i]
            if (item.item_name === modifier) {
                let equipResponse = item.unequip()
                if (!equipResponse) {
                    this.socket.emit('command-response', {message: `${this.name} unequipped ${item.item_name}`})
                } else {
                    this.socket.emit('command-response', {message: equipResponse, alertType: 'danger'})
                }
                return
            }
        }
        this.socket.emit('command-response', {message: `${this.name} does not have an item called ${modifier}`, alertType: 'danger'})
    }

    this.update = function() {
        for(let i = 0; i < this.effects.length; i++) {
            let effect = this.effects[i]
            if (effect.attack > 0) {
                this.socket.emit('command-response', {message: `${this.name} is strengthened ${effect.attack} by ${effect.name}`, alertType: 'secondary'})
            } else if (effect.attack < 0) {
                this.socket.emit('command-response', {message: `${this.name} weakened ${effect.attack} by ${effect.name}`, alertType: 'danger'})
            }
            if (effect.defense > 0) {
                this.socket.emit('command-response', {message: `${this.name} protected ${effect.defense} by ${effect.name}`, alertType: 'secondary'})
            } else if (effect.defense < 0) {
                this.socket.emit('command-response', {message: `${this.name} make vulnerable ${effect.defense} by ${effect.name}`, alertType: 'danger'})
            }
            if (effect.hp < 0) {
                this.socket.emit('command-response', {message: `${this.name} energized ${effect.hp} by ${effect.name}`, alertType: 'secondary'})
            } else if (effect.hp > 0) {
                this.socket.emit('command-response', {message: `${this.name} tired ${effect.hp} by ${effect.name}`, alertType: 'danger'})
            }
            if (effect.mp > 0) {
                this.socket.emit('command-response', {message: `${this.name} excited ${effect.mp} by ${effect.name}`, alertType: 'secondary'})
            } else if (effect.mp < 0) {
                this.socket.emit('command-response', {message: `${this.name} discouraged ${effect.mp} by ${effect.name}`, alertType: 'danger'})
            }
            effect.update(this)
        }
        if (this.hp < 0) {
            this.hp = 0
        }
    }

    this.useCommand = function(modifier) {
        for (let i = 0; i < this.inventory.length; i++) {
            let item = this.inventory[i]
            if (item.item_name === modifier) {
                if (item.usable) {
                    console.log('item is usable')
                    if (!item.use(this)) {
                        this.inventory.splice(i, 1)
                    }
                    this.update()
                    return
                }
                this.socket.emit('command-response', {message: `${item.item_name} is not a usable item`, alertType: 'danger'})
                return
            }
        }
        this.socket.emit('command-response', {message: `${this.name} does not have an item called ${modifier}`, alertType: 'danger'})
    }
}

let game = require('./gameObj')