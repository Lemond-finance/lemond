export default function(sequelize, DataTypes) {
    var Lend = sequelize.define("lend", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        token_name: DataTypes.STRING(10),
        market_size: DataTypes.INTEGER,
        total_borrowed: DataTypes.INTEGER,
        deposit_apy: DataTypes.INTEGER,
        borrow_apy: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
    })
    Lend.sync()
    return Lend
}
