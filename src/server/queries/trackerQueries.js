import db from "@/database/models";

const { Project, Client, ProjectQuotation, ProjectPurchaseOrder, Sequelize } = db;
const { Op } = Sequelize;

export { Op };

export function findRecentProjects(limit = 10) {
  return Project.findAll({
    limit,
    order: [["created", "DESC"]],
    include: [{ model: Client, as: "Client", attributes: ["client_name"] }],
  });
}

export function findProjectsByRange(rangeWhere) {
  return Project.findAll({
    where: { ...rangeWhere("created") },
    include: [{ model: Client, as: "Client", attributes: ["client_name"] }],
    attributes: ["project_id", "title", "created"],
    order: [["created", "DESC"]],
  });
}

export function findProposalsByRange(rangeWhere) {
  return ProjectQuotation.findAll({
    where: { ...rangeWhere("created") },
    include: [
      {
        model: Project,
        as: "Project",
        attributes: ["project_id", "client_id", "title"],
        include: [{ model: Client, as: "Client", attributes: ["client_name"] }],
      },
    ],
    attributes: ["pq_id", "quotation_number", "created"],
    order: [["created", "DESC"]],
  });
}

export function findPurchaseOrdersByRange(rangeWhere) {
  return ProjectPurchaseOrder.findAll({
    where: { ...rangeWhere("created") },
    include: [
      {
        model: ProjectQuotation,
        as: "Quotation",
        attributes: ["pq_id", "project_id", "quotation_number"],
        include: [
          {
            model: Project,
            as: "Project",
            attributes: ["project_id", "client_id", "title"],
            include: [{ model: Client, as: "Client", attributes: ["client_name"] }],
          },
        ],
      },
    ],
    attributes: ["po_id", "po_number", "created"],
    order: [["created", "DESC"]],
  });
}
