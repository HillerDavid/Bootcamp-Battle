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
    
    this.isAlive = function(){
        return(this.hp < this.level * 10)
    }

    this.attackCommand = function(){
        if (this.room === 'class') {
            this.currentEnemy.hp -= this.attack
            console.log(this.currentEnemy.hp)
        }
        
    }

    this.moveCommand = function(room) {
        let rooms = ['home', 'panera', 'class', 'vending machine']
        if (rooms.includes(room) && !this.currentEnemy) {
            this.room = room
            console.log(`${this.player_name} moved to ${this.room}`)
        }
    }
}