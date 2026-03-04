import 'server-only';
import { completeOverdueTask } from "@/server/controllers/performanceScoreCronController";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  return completeOverdueTask(req);
}
