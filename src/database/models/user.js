module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        uniqueKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      job_position: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      join_date: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_role: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      user_type: {
        type: DataTypes.ENUM("staff", "probation", "internship", "contract"),
        defaultValue: "staff",
        allowNull: true,
      },
      fullname: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      profile_pic: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      age: {
        type: DataTypes.VIRTUAL,
        get() {
          const birthdate = this.getDataValue("birthdate");
          if (!birthdate) return null;
          const diff = new Date().getFullYear() - new Date(birthdate).getFullYear();
          return diff;
        },
      },
      marital_status: {
        type: DataTypes.ENUM("single", "married", "widowed", "divorced"),
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address_on_identity: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      identity_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      identity_type: {
        type: DataTypes.ENUM("ktp", "paspor", "sim"),
        allowNull: true,
      },
      npwp_number: {
        type: DataTypes.CHAR(16),
        allowNull: true,
      },
      tax_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bank_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      bank_account_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      beneficiary_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      currency: {
        type: DataTypes.ENUM("idr", "usd"),
        allowNull: true,
        defaultValue: "idr",
      },
      bpjs_tk_reg_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bpjs_tk_term_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bpjs_tk_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pension_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      bpjs_kes_reg_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bpjs_kes_term_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bpjs_kes_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      emergency_fullname: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      emergency_relationship: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      emergency_contact: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      emergency_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      menu_access: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      is_timesheet: {
        type: DataTypes.ENUM('true', 'false'),
        allowNull: false,
        defaultValue: 'false',
      },
      absent_type: {
        type: DataTypes.ENUM('timeless', 'timeable'),
        allowNull: true,
        defaultValue: 'timeable',
      },
      internship_start_date: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      internship_end_date: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      is_clocked_in: { // Status apakah user sedang dalam sesi kerja (sudah clock-in)
        type: DataTypes.ENUM('true', 'false'),
        allowNull: false,
        defaultValue: 'false',
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: { // Status apakah user merupakan head of department
        type: DataTypes.ENUM('new', 'waiting', 'active', 'banned'),
        allowNull: false,
        defaultValue: 'new',
      },
      performance_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      performance_year: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      attendance_type: {
        type: DataTypes.ENUM("anywhere", "office"),
        allowNull: true,
        defaultValue: "anywhere",
        validate: { isIn: [["anywhere", "office"]] },
      },
      created: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      deleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "user",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null
        }
      }
    }
  );

  User.associate = function (models) {
    models.User.belongsTo(models.Role, { foreignKey: 'user_role', targetKey: 'slug', as: 'RoleDetail' });
    models.User.hasMany(models.UserLocation, { foreignKey: 'user_id', as: 'Locations' });
    User.belongsToMany(models.Task, {
      through: models.TaskAssignment,
      foreignKey: 'user_id',
      as: 'AssignedTask'
    });
    User.hasMany(models.Task, {
      foreignKey: 'created_by',
      as: 'CreatedTasks'
    });
    User.hasMany(models.UserEmployment, {
      as: 'EmploymentDetails',
      foreignKey: 'user_id',
    });

  };


  return User;
};
