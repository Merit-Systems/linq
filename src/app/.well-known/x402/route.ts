// Side-effect imports: ensure all routes are registered before well-known runs.
import "@/lib/routes.registry";
import { router } from "@/lib/router";

export const GET = router.wellKnown();
