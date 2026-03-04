"use client";
import { useEffect, useMemo, useState } from "react";
import { Dropdown, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export default function OverviewSection({ onAddPitch, onAddProject, onAddTask, session, menuButtons }) {
  const [allowedPathSet, setAllowedPathSet] = useState(new Set());

  const buttons = useMemo(
    () => (Array.isArray(menuButtons) ? menuButtons : (session?.user?.menu?.buttons || [])),
    [menuButtons, session]
  );

  useEffect(() => {
    const collectPaths = (src) => {
      let paths = [];
      for (const p of src || []) {
        if (p?.path) paths.push(p.path);
        if (Array.isArray(p?.children) && p.children.length) {
          paths = paths.concat(collectPaths(p.children));
        }
      }
      return paths;
    };

    const paths = collectPaths(buttons);
    setAllowedPathSet(new Set(paths));
  }, [buttons]);

  const canAddPitch = allowedPathSet.has("add_pitching");
  const canAddProject = allowedPathSet.has("add_project");
  const canAddTask = allowedPathSet.has("add_task");

  return (
    <section className="mb-4">
      <div className="flex items-center">
        <h3 className="fc-base text-lg me-auto">Overview</h3>

        {/* Mobile dropdown */}
        <div className="flex gap-x-2 items-center sm:hidden">
          <Dropdown
            placement="bottomRight"
            trigger="click"
            menu={{
              items: [
                canAddPitch && {
                  key: "1",
                  icon: <PlusOutlined />,
                  label: <button onClick={onAddPitch}>Add Pitch</button>,
                },
                canAddProject && {
                  key: "2",
                  icon: <PlusOutlined />,
                  label: <button onClick={onAddProject}>Add Project</button>,
                },
                canAddTask && {
                  key: "3",
                  icon: <PlusOutlined />,
                  label: <button onClick={onAddTask}>Add Task</button>,
                },
              ].filter(Boolean),
            }}
          >
            <Button type="primary" className="btn-blue-filled px-5" icon={<PlusOutlined />}>
              Add
            </Button>
          </Dropdown>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-2">
          {canAddPitch && (
            <Button
              onClick={onAddPitch}
              type="primary"
              className="btn-blue-filled px-5"
              icon={<PlusOutlined />}
            >
              Add Pitch
            </Button>
          )}
          {canAddProject && (
            <Button
              onClick={onAddProject}
              type="primary"
              className="btn-blue-filled px-5"
              icon={<PlusOutlined />}
            >
              Add Project
            </Button>
          )}
          {canAddTask && (
            <Button
              onClick={onAddTask}
              type="primary"
              className="btn-blue-filled px-5"
              icon={<PlusOutlined />}
            >
              Add Task
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
