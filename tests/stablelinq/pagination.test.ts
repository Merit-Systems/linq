import { describe, expect, it } from "vitest";
import {
  decodeStablelinqCursor,
  encodeStablelinqCursor,
} from "@/lib/stablelinq/pagination";

describe("stablelinq pagination", () => {
  it("round-trips cursor payloads", () => {
    const payload = {
      createdAt: "2026-07-17T12:00:00.000Z",
      id: "clxyz123",
    };
    const cursor = encodeStablelinqCursor(payload);
    expect(decodeStablelinqCursor(cursor)).toEqual(payload);
  });

  it("returns null for invalid cursors", () => {
    expect(decodeStablelinqCursor("not-valid")).toBeNull();
    expect(decodeStablelinqCursor("")).toBeNull();
  });
});
