import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { LINQ_WRITE_ROUTES, STABLELINQ_OPS_ROUTES } from "@/lib/routes.backends.generated";
import {
  STABLELINQ_DB_ROUTES,
  STABLELINQ_WEBHOOK_ROUTES,
} from "@/lib/routes.backends.stablelinq";

const ROOT = join(import.meta.dirname, "../..");

function findRouteFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findRouteFiles(full, acc);
    else if (entry === "route.ts") acc.push(full);
  }
  return acc;
}

describe("route backends", () => {
  it("tags all linq-write routes with linq-write backend", () => {
    expect(LINQ_WRITE_ROUTES.length).toBeGreaterThan(0);
    for (const route of LINQ_WRITE_ROUTES) {
      expect(route.backend).toBe("linq-write");
    }
  });

  it("lists stablelinq-db account read routes", () => {
    const paths = STABLELINQ_DB_ROUTES.map((r) => r.path);
    expect(paths).toContain("account/sent-messages");
    expect(paths).toContain("account/chats");
    expect(paths).toContain("account/sent-messages/{id}");
  });

  it("registry imports linq, stablelinq, and ops registries", () => {
    const registry = readFileSync(
      join(ROOT, "src/lib/routes.registry.ts"),
      "utf8",
    );
    expect(registry).toContain('import "@/lib/routes.linq.registry"');
    expect(registry).toContain('import "@/lib/routes.stablelinq.registry"');
    expect(registry).toContain('import "@/lib/routes.stablelinq-ops.registry"');
  });

  it("tags ops routes with stablelinq-ops backend", () => {
    expect(STABLELINQ_OPS_ROUTES.length).toBe(4);
    for (const route of STABLELINQ_OPS_ROUTES) {
      expect(route.backend).toBe("stablelinq-ops");
    }
  });

  it("generated linq route files include linq-write banner", () => {
    const apiDir = join(ROOT, "src/app/api");
    const linqRoutes = findRouteFiles(apiDir).filter(
      (p) => !p.includes("/account/"),
    );
    for (const file of linqRoutes) {
      const src = readFileSync(file, "utf8");
      if (src.includes(".paid(") || src.includes("quoteMessageSendPrice")) {
        expect(src).toContain("linq-write");
      }
    }
  });

  it("account routes include stablelinq-db banner and siwx", () => {
    for (const file of findRouteFiles(join(ROOT, "src/app/api/account"))) {
      const src = readFileSync(file, "utf8");
      expect(src).toContain("stablelinq-db");
      expect(src).toContain(".siwx()");
    }
  });

  it("documents webhook route separately from agent API", () => {
    expect(STABLELINQ_WEBHOOK_ROUTES[0]?.path).toBe("webhooks/linq");
  });
});

describe("SIWX Linq reads removed from agent API", () => {
  it("does not expose POST /chats cold-start route", () => {
    const slugs = LINQ_WRITE_ROUTES.map((r) => r.slug);
    expect(slugs).not.toContain("chats/create");
  });

  it("excludes siwx-only and removed slugs from linq write registry", () => {
    const slugs = LINQ_WRITE_ROUTES.map((r) => r.slug);
    expect(slugs).not.toContain("chats/list");
    expect(slugs).not.toContain("messages/retrieve");
    expect(slugs).not.toContain("chats/update");
    expect(slugs).not.toContain("chats/mark-as-read");
    expect(slugs).not.toContain("contact-card/create");
    expect(slugs).toContain("messages/create");
  });

  it("ops registry routes use siwx not paid", () => {
    const contactCard = readFileSync(
      join(ROOT, "src/app/api/internal/contact-card/route.ts"),
      "utf8",
    );
    expect(contactCard).toContain(".siwx()");
    expect(contactCard).not.toContain(".paid(");
  });
});
