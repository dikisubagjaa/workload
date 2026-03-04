import db from "@/database/models";

const { CountryCode } = db;

export function findAllCountryCodes() {
  return CountryCode.findAll();
}
