import { notify as notifyUser } from "@/utils/notifier";
import { findActiveUsers } from "@/server/queries/blastQueries";

export async function sendBlast(body) {
  const type = String(body?.type || "").toLowerCase();
  const message = body?.message;

  if (!message) return { status: 400, msg: "message is required" };

  if (type === "select") {
    const users = Array.isArray(body.users) ? body.users : [];
    users.forEach((user_id) => {
      try {
        notifyUser({
          userId: user_id,
          sender: "General",
          description: message,
          email: false,
          url: "",
          payload: "",
        });
      } catch (e) {
        console.warn("Failed to send status change notification:", e?.message || e);
      }
    });
  } else if (type === "all") {
    const users = await findActiveUsers();
    users.forEach((value) => {
      try {
        notifyUser({
          userId: value.user_id,
          sender: "General",
          description: message,
          email: false,
          url: "",
          payload: "",
        });
      } catch (e) {
        console.warn("Failed to send status change notification:", e?.message || e);
      }
    });
  } else {
    return { status: 400, msg: "Invalid type" };
  }

  return { msg: "Blast Berhasil!", received: body };
}

