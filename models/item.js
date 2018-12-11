module.exports = function(sequelize, DataTypes) {
    let Item = sequelize.define('Item', {
        item_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true,
                len: [1]
            }
        },
        attack: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        defense: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        hp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        mp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        equippable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        usable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        equipped: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    })

    Item.associate = function(models) {
        models.Item.belongsTo(models.Player, {
            foreignKey: {
                allowNull: false
            }
        })
    }

    return Item
}