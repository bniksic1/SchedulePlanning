const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt2018463", "root", "root", {
    host: "localhost",
    dialect: "mysql",
    define: {
        timestamps: false
    }
});
const DB={};

DB.Sequelize = Sequelize;
DB.sequelize = sequelize;

//import modela
DB.Aktivnost = require(__dirname+"/modeli/aktivnost.js")(sequelize, Sequelize.DataTypes)
DB.Dan = require(__dirname+"/modeli/dan.js")(sequelize, Sequelize.DataTypes)
DB.Grupa = require(__dirname+"/modeli/grupa.js")(sequelize, Sequelize.DataTypes)
DB.Predmet = require(__dirname+"/modeli/predmet.js")(sequelize, Sequelize.DataTypes)
DB.Student = require(__dirname+"/modeli/student.js")(sequelize, Sequelize.DataTypes)
DB.Tip = require(__dirname+"/modeli/tip.js")(sequelize, Sequelize.DataTypes)

//Relacija Predmet 1-N Grupa
DB.Predmet.hasMany(DB.Grupa);
DB.Grupa.belongsTo(DB.Predmet);

//Relacija Aktivnost N-1 Predmet
DB.Predmet.hasMany(DB.Aktivnost);
DB.Aktivnost.belongsTo(DB.Predmet);

//Relacija Aktivnost N-0 Grupa;
DB.Grupa.hasMany(DB.Aktivnost);
DB.Aktivnost.belongsTo(DB.Grupa);

//Relacija Aktivnost N-1 Dan 
DB.Dan.hasMany(DB.Aktivnost);
DB.Aktivnost.belongsTo(DB.Dan);

//Relacija Aktivnost N-1 Tip
DB.Tip.hasMany(DB.Aktivnost);
DB.Aktivnost.belongsTo(DB.Tip);

//Relacija Student N-M Grupa
DB.Student.belongsToMany(DB.Grupa, { as: 'grupe', through: 'studentgrupa', foreignKey: 'studentId' });
DB.Grupa.belongsToMany(DB.Student, { as: 'studenti', through: 'studentgrupa', foreignKey: 'grupaId' });

module.exports=DB;