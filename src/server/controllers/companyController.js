import { nowUnix } from "@/utils/dateHelpers";
import { createCompany, findAllCompanies, findCompanyByTitleAndType } from "@/server/queries/companyQueries";

export async function listCompanies() {
  const rows = await findAllCompanies();
  return { companies: rows.map((x) => (x?.toJSON ? x.toJSON() : x)) };
}

export async function createCompanyFromBody(body, currentUser) {
  const title = String(body?.title || "").trim();
  const legalType = String(body?.legal_type || "").trim().toUpperCase();
  const address = body?.address != null ? String(body.address).trim() : null;

  if (!title || !legalType) {
    return { httpStatus: 400, msg: "Title and legal_type are required." };
  }
  if (!["PT", "CV", "UNOFFICIAL"].includes(legalType)) {
    return { httpStatus: 400, msg: "Invalid legal_type." };
  }

  const existing = await findCompanyByTitleAndType(title, legalType);
  if (existing) {
    return {
      httpStatus: 200,
      msg: "Company already exists.",
      company: existing.toJSON ? existing.toJSON() : existing,
    };
  }

  const ts = nowUnix();
  const company = await createCompany({
    title,
    legal_type: legalType,
    address: address || null,
    created: ts,
    created_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  return { httpStatus: 201, msg: "Company created.", company: company.toJSON() };
}
