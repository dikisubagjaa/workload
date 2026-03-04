import db from "@/database/models";

const { UserLocation } = db;

export function createUserLocation(payload) {
  return UserLocation.create(payload);
}

