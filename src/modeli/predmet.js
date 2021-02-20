const Sequelize = require("sequelize");
const sequelize = require("../DB.js");

module.exports = function (sequelize, DataTypes) {
    const Predmet = sequelize.define('predmet', {
        naziv: Sequelize.STRING
    })
    return Predmet;
}
