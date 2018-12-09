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
    

    this.attackCommand = function(){
        if (this.canAttack()) {
            this.currentEnemy.hp -= this.attack
            this.attacked = true
            console.log(`${this.currentEnemy.enemyName}'s hp: ${this.currentEnemy.hp}`)
            return this.currentEnemy.isAlive()  
        }
        return true
    }

    this.canAttack = function() {
        if (this.room === 'class' && !this.attacked && this.currentEnemy) {
            return true
        }
        return false
    }

    this.isAlive = function(){
        return(this.hp < this.level * 10)
    }

    this.moveCommand = function(room) {
        let rooms = ['home', 'panera', 'class', 'vending machine']
        if (rooms.includes(room) && !this.currentEnemy) {
            this.room = room
            console.log(`${this.player_name} moved to ${this.room}`)
        }
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