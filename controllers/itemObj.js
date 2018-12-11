module.exports = function Item(item_name, attack, defense, hp, mp, equipped) {
    this.item_name = item_name
    this.attack = attack
    this.defense = defense
    this.hp = hp
    this.mp = mp
    this.equipped = equipped
    this.quantity = 1

    this.equip = function() {
        this.equipped = true
    }

    this.unequip = function() {
        this.equipped = false
    }

    this.use = function() {
        this.quantity--
        if (this.quantity > 0) {
            return true
        }
        return false
    }
}