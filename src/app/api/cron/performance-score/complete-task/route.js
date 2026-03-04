import 'server-only';
import { completeTaskOnDeadline } from "@/server/controllers/performanceScoreCronController";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  return completeTaskOnDeadline(req);
}
