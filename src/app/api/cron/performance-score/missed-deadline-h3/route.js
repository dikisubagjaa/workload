import 'server-only';
import { missedDeadlineH3 } from "@/server/controllers/performanceScoreCronController";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  return missedDeadlineH3(req);
}
