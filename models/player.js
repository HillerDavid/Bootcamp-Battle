let bcrypt = require('bcrypt-nodejs')

module.exports = function(sequelize, DataTypes) {
    let Player = sequelize.define('Player', {
        player_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true,
                len: [1]
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.TEXT,
            validate: {
                notEmpty: true,
                len: [1]
            }
        },
        attack: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        defense: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        hp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        mp: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        currency: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        homework_completed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        exp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
            validate: {
                min: 1
            }
        }
    })

    Player.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password)
    }

    Player.hook('beforeCreate', function(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null)
    })

    Player.associate = function(models) {
        models.Player.hasMany(models.Item, {
            onDelete: 'CASCADE'
        })
    }
    return Player
}