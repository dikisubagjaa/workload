// src/components/menu-role/MenuPickerModal.jsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Modal, Tree, Input, Space, Button } from "antd";

const { Search } = Input;

function buildTree(menus = []) {
  const byParent = new Map();
  menus.forEach(m => {
    const pid = m.parent_id ?? null;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid).push(m);
  });

  const makeNodes = (parentId = null) => {
    const children = byParent.get(parentId) || [];
    return children.map(c => ({
      key: String(c.menu_id),
      title: c.title,
      // simpan data utk filter cepat
      _raw: c,
      children: makeNodes(c.menu_id),
    }));
  };

  // root = parent_id null/undefined/0
  return makeNodes(null).concat(makeNodes(undefined)).concat(makeNodes(0));
}

function filterTree(nodes, q) {
  if (!q) return nodes;
  const qq = q.toLowerCase();
  const recur = (arr) => {
    const out = [];
    for (const n of arr) {
      const selfMatch = (n.title || "").toLowerCase().includes(qq) ||
                        (n._raw?.path || "").toLowerCase().includes(qq);
      const childFiltered = n.children?.length ? recur(n.children) : [];
      if (selfMatch || childFiltered.length) {
        out.push({ ...n, children: childFiltered });
      }
    }
    return out;
  };
  return recur(nodes);
}

function collectAllKeys(nodes) {
  const keys = [];
  const walk = (arr) => {
    for (const n of arr) {
      keys.push(n.key);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return keys;
}

export default function MenuPickerModal({
  open,
  menus = [],
  initialSelected = [],
  onApply,      // (ids:number[]) => void
  onCancel,     // () => void
  title = "Select Menus"
}) {
  const treeDataFull = useMemo(() => buildTree(menus), [menus]);

  const [search, setSearch] = useState("");
  const treeData = useMemo(() => filterTree(treeDataFull, search), [treeDataFull, search]);

  // antd Tree pakai string key; form kamu pakai number id
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);

  // sinkron awal tiap kali dibuka
  useEffect(() => {
    if (open) {
      const asString = (initialSelected || []).map(String);
      setCheckedKeys(asString);
      // expand root agar user lihat isi
      setExpandedKeys(collectAllKeys(treeData.map(n => ({ ...n, children: [] }))));
    }
  }, [open, initialSelected, treeData]);

  const onCheck = (keys /*, info*/) => {
    // keys bisa array string atau { checked, halfChecked } tergantung prop
    setCheckedKeys(Array.isArray(keys) ? keys : (keys?.checked || []));
  };

  const handleSelectAll = useCallback(() => {
    const keys = collectAllKeys(treeData);
    setCheckedKeys(keys);
  }, [treeData]);

  const handleClearAll = useCallback(() => {
    setCheckedKeys([]);
  }, []);

  const handleOk = () => {
    const ids = (checkedKeys || []).map(k => Number(k)).filter(Number.isFinite);
    onApply?.(ids);
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      width={720}
    >
      <Space style={{ marginBottom: 10 }} wrap>
        <Search
          placeholder="Search menu title or path…"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
        />
        <Button onClick={handleSelectAll}>Check All (visible)</Button>
        <Button onClick={handleClearAll}>Clear All</Button>
      </Space>

      <div style={{ maxHeight: 420, overflow: "auto", border: "1px solid #f0f0f0", borderRadius: 8, padding: 8 }}>
        <Tree
          checkable
          // cascade parent-child (default): checkStrictly = false
          checkedKeys={checkedKeys}
          onCheck={onCheck}
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          defaultExpandAll
        />
      </div>
    </Modal>
  );
}
