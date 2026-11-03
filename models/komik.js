module.exports = (sequelize, DataTypes) => {
  const Komik = sequelize.define("Komik",

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },