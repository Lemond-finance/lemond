export default function(sequelize, DataTypes) {
    var Airdrop = sequelize.define("airdrop", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        address: DataTypes.STRING,
        telegram: DataTypes.STRING,
        twitter: DataTypes.STRING,
        tweet: DataTypes.STRING,
        status: DataTypes.INTEGER,
    })
    Airdrop.sync()
    return Airdrop
}
