export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { promoteAttachmentStar } from "@/server/controllers/taskController";

export async function POST(_req, { params }) {
  const { taskId, subtaskItemId, attachmentId } = params;
  if (!attachmentId) {
    return jsonResponse({ msg: 'attachmentId is required' }, { status: 400 });
  }

  try {
    const result = await promoteAttachmentStar(subtaskItemId, attachmentId);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (e) {
    return jsonResponse({ msg: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
