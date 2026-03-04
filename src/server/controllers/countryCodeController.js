import { findAllCountryCodes } from "@/server/queries/countryCodeQueries";

export async function listCountryCodes() {
  const countryCodeData = await findAllCountryCodes();
  return { countryCode: countryCodeData };
}
