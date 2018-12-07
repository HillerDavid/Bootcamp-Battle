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
            validate: {
                notNull: true,
                min: 0
            }
        },
        defense: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                notNull: true,
                min: 0
            }
        },
        hp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                notNull: true,
                min: 0
            }
        },
        mp: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            validate: {
                notNull: true,
                min: 0
            }
        },
        currency: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                notNull: true,
                min: 0
            }
        },
        homework_completed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                notNull: true,
                min: 0
            }
        },
        exp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                notNull: true,
                min: 0
            }
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                notNull: true,
                min: 1
            }
        }
    })
    return Player
}