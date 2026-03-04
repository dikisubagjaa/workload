module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("project");
    if (!table.company_product) {
      await queryInterface.addColumn("project", "company_product", {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("project");
    if (table.company_product) {
      await queryInterface.removeColumn("project", "company_product");
    }
  },
};
