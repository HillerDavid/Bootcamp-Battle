module.exports = function Effect(name, attack, defense, hp, mp, turns, pulse) {
    this.name = name
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.mp = mp
    this.turns = turns
    this.pulse = pulse
    this.first = true

    this.update = function(target) {
        this.turns--
        if (this.first || this.pulse) {
            this.first = false
            target.attack += attack
            target.defense += defense
            target.hp += hp
            target.mp += mp
        }
        this.checkTurns(target)
    }

    this.checkTurns = function(target) {
        console.log(`${this.turns} turns left for ${this.name}`)
        if (this.turns < 1) {
            if (this.turns === 0) {
                this.undoEffect(target)
            }
            for(let i = 0; i < target.effects.length; i++) {
                if (target.effects[i].name === this.name) {
                    console.log(`Effect of ${this.name} being removed`)
                    target.effects.splice(i, 1)
                    return
                }
            }
        }
    }

    this.undoEffect = function(target) {
        console.log(`Effects of ${this.name} being undone`)
        target.attack -= attack
        target.defense -= defense
        target.hp -= hp
        target.mp -= mp
        if (target.level) {
            target.socket.emit('command-response', { message: `The effect of ${this.name} has worn off.`, alertType: 'secondary' })
            if (target.currentEnemy && target.currentEnemy.level) {
                target.currentEnemy.socket.emit('command-response', { message: `The effect of ${this.name} has worn off for ${target.name}.`, alertType: 'secondary' })
            }
        }
    }
}