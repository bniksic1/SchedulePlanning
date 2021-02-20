const Sequelize = require("sequelize");
const sequelize = require("../DB.js");

module.exports = function (sequelize, DataTypes) {
    const Aktivnost = sequelize.define('aktivnost', {
        naziv: Sequelize.STRING,
        pocetak: Sequelize.FLOAT,
        kraj: Sequelize.FLOAT
    })
    return Aktivnost;
}
