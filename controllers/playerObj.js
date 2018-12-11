module.exports = function Player(player_id, player_name, attack, defense, hp, mp, currency, homework_completed, exp, level){
    this.player_id = player_id
    this.player_name = player_name
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.mp = mp
    this.currency = currency
    this.homework_completed = homework_completed
    this.exp = exp
    this.level = level
    this.room = 'home'
    this.reference
    this.currentEnemy
    this.attacked = false
    this.inventory = []
    
    //This is the method where the player actually attacks the enemy they are fighting
    this.attackCommand = function(){
        //Check if the player can attack
        if (this.canAttack()) {
            //Do damage to the enemy corresponding to the attack
            this.currentEnemy.hp -= this.attack
            //Store that the player has attacked already this turn
            this.attacked = true
            console.log(`${this.currentEnemy.enemyName}'s hp: ${this.currentEnemy.hp}`)
            //Return whether the enemy is alive or not
            return this.currentEnemy.isAlive()  
        }
        //The player does not have the ability to attack, so the enemy must still be alive
        return true
    }

    //Returns if the player has the ability to attack
    this.canAttack = function() {
        //If they are in the right room, they haven't attacked yet this turn, AND are fighting an enemy they can attack
        if (this.room === 'class' && !this.attacked && this.currentEnemy) {
            return true
        }
        return false
    }

    //Returns if the player is still alive
    this.isAlive = function(){
        return(this.hp < this.level * 10)
    }

    //Move the player around the world
    this.move = function(room) {
        //Define the available areas
        let rooms = ['home', 'panera', 'class', 'vending machine']
        //If the area they are trying to go to is an available area and they are not in the process of fighting an enemy 
        if (rooms.includes(room) && !this.currentEnemy) {
            //Move them to the room they are trying to access
            this.room = room
            console.log(`${this.player_name} moved to ${this.room}`)
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
    this.sleep = function() {
        if (this.room === 'home') {
            this.hp = 0
            return true
        }
        return false
    }
}