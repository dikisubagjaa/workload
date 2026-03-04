import { findProjectsWithChildTasks } from "@/server/queries/projectTaskQueries";

export async function getProjectTaskTree() {
  const projectData = await findProjectsWithChildTasks();

  const treeData = projectData.map((project) => ({
    title: project.title,
    value: `project-${project.project_id}`,
    disabled: true,
    children: (project.Task || []).map((task) => ({
      title: task.title,
      value: `${project.project_id}-${task.task_id}`,
    })),
  }));

  return { data: treeData };
}
