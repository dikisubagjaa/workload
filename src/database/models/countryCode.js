module.exports = (sequelize, DataTypes) => {
  
    const CountryCode = sequelize.define(
        "CountryCode",
        {
            countrycode_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
              },             
              title: {
                type: DataTypes.STRING(100),
                allowNull: false,
              },
              code: {
                type: DataTypes.STRING(50),
                allowNull: false,
              },
              iso: {
                type: DataTypes.STRING(50),
                allowNull: true,
              },
              updated: {
                  type: DataTypes.DATE,
                  allowNull: false,
              },
        },
        {
            tableName: "countrycode",
            timestamps: false
        }
    );
  
    return CountryCode;
  };
  