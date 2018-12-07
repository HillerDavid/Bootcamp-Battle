module.exports = function Player(player_id, player_name, attack, defense, hp, mp, currency, homework_completed, exp, level){
    this.player_id = player_id;
    this.player_name = player_name;
    this.attack = attack;
    this.defense = defense;
    this.hp = hp;
    this.mp = mp;
    this.currency = currency;
    this.homework_completed = homework_completed;
    this.exp = exp;
    this.level = level;
}