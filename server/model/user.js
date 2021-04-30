export default function(sequelize, DataTypes) {
    var User = sequelize.define("user", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      uuid: DataTypes.STRING(10),
      username: DataTypes.STRING(20),
      password: DataTypes.STRING,
      sex: DataTypes.INTEGER,
      birthday: DataTypes.DATE,
      signature: DataTypes.STRING,
      avatar: DataTypes.STRING,
      user_cover: DataTypes.STRING,
      token: DataTypes.STRING,
      rongim_token: DataTypes.STRING,
      email: {
        type: DataTypes.STRING(32),
        validate: {
          isEmail: true
        }
      },
      createDate: DataTypes.INTEGER,
      phoneNumber: DataTypes.STRING,
      userState: DataTypes.INTEGER,
      fans_count: DataTypes.INTEGER,
      follow_count: DataTypes.INTEGER,
      collect_count: DataTypes.INTEGER,
      like_count: DataTypes.INTEGER,
      work_count: DataTypes.INTEGER,
      weibo_uid: DataTypes.STRING,
      qq_openid: DataTypes.STRING,
      weixin_unionid: DataTypes.STRING,
      is_admin: DataTypes.INTEGER
    });
    User.sync();
    return User;
}
