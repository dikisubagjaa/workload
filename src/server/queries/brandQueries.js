import db from "@/database/models";

const { Brand } = db;

export function findAllBrands() {
  return Brand.findAll({ where: { deleted: null } });
}

export function findBrandById(brandId) {
  return Brand.findOne({ where: { brand_id: brandId, deleted: null } });
}

export function createBrand(payload) {
  return Brand.create(payload);
}

export function updateBrandById(brandId, updates) {
  return Brand.update(updates, { where: { brand_id: brandId } });
}
