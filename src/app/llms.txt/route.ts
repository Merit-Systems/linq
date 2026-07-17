// Side-effect imports: ensure all routes are registered before llms.txt runs.
import "@/lib/routes.registry";
import { router } from "@/lib/router";

export const GET = router.llmsTxt();
