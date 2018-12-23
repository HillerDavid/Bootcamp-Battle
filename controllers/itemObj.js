let Effect = require('./effectObj')

module.exports = function Item(item_name, attack, defense, hp, mp, equippable, usable, equipped) {
    this.item_name = item_name
    this.effect = new Effect('Item', attack, defense, hp, mp, 0, false)
    this.equippable = equippable
    this.usable = usable
    this.equipped = equipped
    this.quantity = 1

    this.equip = function() {
        if (this.equippable) {
            this.equipped = true
        }
    }

    this.unequip = function() {
        if (this.equippable) {
            this.equipped = false
        }
    }

    this.use = function(player) {
        if (this.usable) {
            this.quantity--
            let found = false
            for(let key of player.effects) {
                if (key === this.effect.name) {
                    player.effects[key].turns += this.effect.turns
                    console.log('Added to effect turns')
                    found = true
                    break
                }
            }
            if (!found) {
                console.log('Added effect')
                player.effects.push(new Effect(this.effect.name, this.effect.attack, this.effect.defense, this.effect.hp, this.effect.mp, this.effect.turns, this.effect.pulse))
            }
            if (this.quantity > 0) {
                return true
            }
            return false
        }
    }
}