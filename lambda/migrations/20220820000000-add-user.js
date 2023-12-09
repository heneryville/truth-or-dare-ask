'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users',{
      id: { type: Sequelize.STRING, primaryKey: true, allowNull: false},
      dareIndex: { type: Sequelize.INTEGER, allowNull: false},
      truthIndex: { type: Sequelize.INTEGER, allowNull: false},
      lastSubOffer: { type: Sequelize.DATE, allowNull: true},
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: Sequelize.DATE,
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};
