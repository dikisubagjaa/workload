import { nowUnix } from "@/utils/dateHelpers";
import { createProjectType, findProjectTypes } from "@/server/queries/projectTypeQueries";

export async function listProjectTypes() {
  const projectTypes = await findProjectTypes();
  return { projectType: projectTypes };
}

export async function createProjectTypeFromBody(body, currentUser) {
  if (!body.title || body.title.trim() === "") {
    return { status: 400, msg: "Title is required." };
  }

  const ts = nowUnix();
  const newProjectType = await createProjectType({
    title: body.title,
    created: ts,
    created_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  return { status: 201, msg: "Project Type added successfully", projectType: newProjectType };
}
