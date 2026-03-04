import { nowUnix } from "@/utils/dateHelpers";
import { createBrand, findAllBrands, findBrandById, updateBrandById } from "@/server/queries/brandQueries";

export async function listBrands() {
  const brands = await findAllBrands();
  return { brand: brands };
}

export async function createBrandFromBody(body, currentUser) {
  const title = String(body?.title || "").trim();
  if (!title) {
    return { status: 400, msg: "Title is required." };
  }

  const userId = currentUser?.user_id;
  if (!userId) {
    return { status: 401, msg: "Unauthenticated" };
  }

  const ts = nowUnix();

  const newBrand = await createBrand({
    title,
    created: ts,
    created_by: userId,
    updated: ts,
    updated_by: userId,
  });

  return { status: 201, msg: "Brand added successfully", brand: newBrand };
}

export async function getBrandById(brandId) {
  const brand = await findBrandById(brandId);
  if (!brand) return { httpStatus: 404, msg: "Brand not found" };
  return { brand: brand.toJSON ? brand.toJSON() : brand };
}

export async function updateBrandFromBody(brandId, body, currentUser) {
  const title = body?.title != null ? String(body.title).trim() : null;
  if (!title) return { httpStatus: 400, msg: "Title is required." };

  const userId = currentUser?.user_id;
  if (!userId) return { httpStatus: 401, msg: "Unauthenticated" };

  const ts = nowUnix();
  const [affected] = await updateBrandById(brandId, {
    title,
    updated: ts,
    updated_by: userId,
  });

  if (!affected) return { httpStatus: 404, msg: "Brand not found" };

  const updated = await findBrandById(brandId);
  return { msg: "Brand updated", brand: updated?.toJSON ? updated.toJSON() : updated };
}

export async function deleteBrand(brandId, currentUser) {
  const userId = currentUser?.user_id;
  if (!userId) return { httpStatus: 401, msg: "Unauthenticated" };

  const ts = nowUnix();
  const [affected] = await updateBrandById(brandId, {
    deleted: ts,
    deleted_by: userId,
    updated: ts,
    updated_by: userId,
  });

  if (!affected) return { httpStatus: 404, msg: "Brand not found" };

  return { msg: "Brand deleted" };
}
