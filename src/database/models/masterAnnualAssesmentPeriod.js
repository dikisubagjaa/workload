module.exports = (sequelize, DataTypes) => {
  const MasterAnnualAssesmentPeriod = sequelize.define(
    "MasterAnnualAssesmentPeriod",
    {
      period_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      year: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
        unique: true,
      },
      open_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      close_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      created: { type: DataTypes.INTEGER, allowNull: false },
      created_by: { type: DataTypes.BIGINT, allowNull: false },
      updated: { type: DataTypes.INTEGER, allowNull: false },
      updated_by: { type: DataTypes.BIGINT, allowNull: false },
      deleted: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      deleted_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: "master_annual_assestment_period",
      timestamps: false,
      defaultScope: {
        where: { deleted: null, deleted_by: null, is_active: 1 },
      },
      indexes: [
        { unique: true, name: "uq_year", fields: ["year"] },
        { name: "idx_open_close", fields: ["open_at", "close_at"] },
      ],
    }
  );

  return MasterAnnualAssesmentPeriod;
};
