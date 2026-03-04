import 'server-only';
import { missedDeadlineH7 } from "@/server/controllers/performanceScoreCronController";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  return missedDeadlineH7(req);
}
