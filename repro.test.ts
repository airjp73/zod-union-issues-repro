import { it, expect } from "vitest";
import { z as z3, ZodError } from "zod3";
import { z as z4 } from "zod4";

it("should work", () => {
  const schema3 = z3.object({
    foo: z3.union([z3.string(), z3.number()]),
  });
  const schema4 = z4.object({
    foo: z4.union([z4.string(), z4.number()]),
  });

  const z3Result = schema3["~standard"].validate({ foo: [] });
  const z4Result = schema4["~standard"].validate({ foo: [] });

  const getIssues = (result: typeof z3Result | typeof z4Result) => {
    if ("issues" in result) {
      const extractIssues = (issues: typeof result.issues) =>
        issues?.flatMap((i) => {
          if ("unionErrors" in i)
            return i.unionErrors.flatMap((unionError: ZodError) => {
              return extractIssues(unionError.issues);
            });
          if ("errors" in i)
            return i.errors.flatMap((issues) => {
              return extractIssues(issues);
            });
          return [i];
        }) ?? [];
      return extractIssues(result.issues);
    }
    if ("issues" in result) return result.issues;
    return [];
  };

  console.log(getIssues(z4Result));
  expect(getIssues(z3Result).map((i) => i.path)).toEqual(
    getIssues(z4Result).map((i) => i.path),
  );
});
