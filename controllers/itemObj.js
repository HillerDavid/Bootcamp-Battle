module.exports = function Item(item_name, attack, defense, hp, mp, equippable, usable, equipped) {
    this.item_name = item_name
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.mp = mp
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

    this.use = function() {
        if (this.usable) {
            this.quantity--
            if (this.quantity > 0) {
                return true
            }
            return false
        }
    }
}