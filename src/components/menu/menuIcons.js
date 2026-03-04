import React from "react";

// Import paket-paket icon yang mau kamu support.
// Tambah/kurangi sesuai kebutuhan project.
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as Hi2Icons from "react-icons/hi2";
import * as TbIcons from "react-icons/tb";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as IoIcons from "react-icons/io5";

// Kumpulan library yang akan discan saat mencari icon
const ICON_LIBRARIES = [
  MdIcons,
  HiIcons,
  Hi2Icons,
  TbIcons,
  FaIcons,
  Fa6Icons,
  IoIcons,
];

// Normalisasi string key
function normalizeKey(name) {
  if (!name) return "";
  return String(name).trim();
}

// Cari COMPONENT dari nama icon
// Contoh: "MdOutlineHome" → MdIcons["MdOutlineHome"]
export function resolveIconComponent(name) {
  const key = normalizeKey(name);
  if (!key) return null;

  for (const lib of ICON_LIBRARIES) {
    if (lib && Object.prototype.hasOwnProperty.call(lib, key)) {
      const Icon = lib[key];
      if (Icon) return Icon;
    }
  }

  return null;
}

// Helper yang dipakai di DrawerMenu & MenuManagementUI
// Return: <Icon /> atau null
export function getMenuIconComponent(name) {
  const Icon = resolveIconComponent(name);
  if (!Icon) return null;
  return <Icon />;
}
