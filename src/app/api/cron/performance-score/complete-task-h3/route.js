import 'server-only';
import { completeTaskH3 } from "@/server/controllers/performanceScoreCronController";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  return completeTaskH3(req);
}
