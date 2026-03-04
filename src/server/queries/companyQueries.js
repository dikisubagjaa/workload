import db from "@/database/models";

const { Company, Sequelize } = db;
const { Op } = Sequelize;

export function findAllCompanies() {
  return Company.findAll({
    where: { deleted: null },
    attributes: ["company_id", "title", "legal_type", "address"],
    order: [["title", "ASC"], ["company_id", "ASC"]],
  });
}

export function findCompanyByTitleAndType(title, legalType) {
  const cleanTitle = String(title || "").trim();
  const cleanType = String(legalType || "").trim();
  if (!cleanTitle || !cleanType) return Promise.resolve(null);

  return Company.findOne({
    where: {
      deleted: null,
      legal_type: cleanType,
      [Op.and]: [Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("title")), cleanTitle.toLowerCase())],
    },
    attributes: ["company_id", "title", "legal_type", "address"],
  });
}

export function createCompany(payload) {
  return Company.create(payload);
}

export function updateCompanyById(companyId, updates, options = {}) {
  return Company.update(updates, {
    where: { company_id: Number(companyId), deleted: null },
    ...options,
  });
}
