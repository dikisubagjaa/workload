export function parseAccessList(src) {
  let arr = [];
  if (Array.isArray(src)) arr = src;
  else if (typeof src === "string") {
    const s = src.trim();
    if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") arr = [];
    else if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try { const p = JSON.parse(s); arr = Array.isArray(p) ? p : []; } catch { arr = s.split(","); }
    } else arr = s.split(",");
  }
  arr = arr.map(v => (typeof v === "string" ? v.trim() : v)).filter(Boolean);

  const idSet = new Set(
    arr
      .map(v => (typeof v === "string" && /^[0-9]+$/.test(v) ? Number(v) : v))
      .filter(v => typeof v === "number")
  );
  const pathSet = new Set(
    arr
      .map(v => (typeof v === "number" ? "" : String(v)))
      .map(s => s.trim().toLowerCase())
      .filter(s => !!s && !/^[0-9]+$/.test(s))
  );
  return { idSet, pathSet };
}

export function isAllowed(row, idSet, pathSet) {
  const byId = idSet.has(row.menu_id);
  const byPath = row.path && pathSet.has(String(row.path).toLowerCase());
  return byId || byPath;
}

/**
 * buildMenuTree(menuRows, allowedFn)
 * - Bangun tree dari semua rows "page".
 * - Node dianggap "allowed" jika lulus allowedFn.
 * - Saat pruning: node muncul bila dirinya allowed ATAU punya child allowed.
 * - Parent otomatis ikut agar hierarki utuh.
 */
export function buildMenuTree(menuRows, allowedFn = () => true) {
  const nodesById = new Map();

  // 1) Normalisasi node
  for (const row of menuRows) {
    nodesById.set(row.menu_id, {
      id: row.menu_id,
      parentId: row.parent_id ?? null,
      order: row.ordered ?? 0,
      key: row.path || String(row.menu_id),
      path: row.path || null,
      label: row.title || "",
      icon: row.icon || null,
      isShow: row.is_show,
      allowed: !!allowedFn(row),
      children: [],
    });
  }

  // 2) Link parent-child
  const roots = [];
  for (const node of nodesById.values()) {
    if (node.parentId && nodesById.has(node.parentId)) {
      nodesById.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  // 3) Sort
  const sortByOrder = (a, b) => (a.order || 0) - (b.order || 0);
  function sortTree(n, depth = 0) {
    if (depth > 50) return; // guard loop sederhana
    n.children.sort(sortByOrder);
    n.children.forEach(c => sortTree(c, depth + 1));
  }
  roots.sort(sortByOrder);
  roots.forEach(n => sortTree(n));

  // 4) Prune: tampilkan jika allowed atau punya anak allowed
  function prune(n) {
    const keptChildren = n.children.map(prune).filter(Boolean);
    const keepThis = n.allowed || keptChildren.length > 0;
    if (!keepThis) return null;
    const out = {
      key: n.key,
      path: n.path,
      label: n.label,
      icon: n.icon,
      isShow: n.isShow,
    };
    if (keptChildren.length) out.children = keptChildren;
    return out;
  }

  return roots.map(prune).filter(Boolean);
}
