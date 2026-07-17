import LinqAPIV3 from "@linqapp/sdk";

export function mapLinqError(err: unknown): Error & { status?: number } {
  if (err instanceof LinqAPIV3.APIError) {
    return Object.assign(new Error(err.message), { status: err.status });
  }
  if (err instanceof Error) {
    return err;
  }
  return Object.assign(new Error("Unknown Linq error"), { status: 500 });
}
