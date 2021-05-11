export default function(sequelize, DataTypes) {
    var Lend = sequelize.define("lend", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        token_name: DataTypes.STRING(10),
        market_size: DataTypes.STRING,
        total_borrow: DataTypes.STRING,
        deposit_total_apy: DataTypes.STRING,
        borrow_total_apy: DataTypes.STRING,
        supply_apy: DataTypes.STRING,
        supply_distribution_apy: DataTypes.STRING,
        borrow_apy: DataTypes.STRING,
        borrow_distribution_apy: DataTypes.STRING,
        status: DataTypes.INTEGER,
    })
    Lend.sync()
    return Lend
}
