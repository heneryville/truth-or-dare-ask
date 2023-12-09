const { Sequelize } = require("sequelize");

module.exports = function(sequelize) {
  var User = sequelize.define('User', {
    dareIndex: {type: Sequelize.INTEGER, defaultValue: -1},
    truthIndex: {type: Sequelize.INTEGER, defaultValue: -1},
    lastSubOffer: {type: Sequelize.DATE},
  },
  {});

  User.associate = function(models) {
    // User.hasMany(models.Attempt, {foreignKey: 'userId'})
  }

  User.get = async function(id, defaults) {
    const [user, isNew] = await User.findOrCreate({
      where: {id},
      defaults: Object.assign({
        id,
      },defaults)
    });
    user.isNew = isNew;
    return user;
  }

  return User;
};
