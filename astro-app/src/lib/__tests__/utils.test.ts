import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() — class name utility", () => {
  it("merges simple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles empty string inputs", () => {
    expect(cn("", "px-4", "")).toBe("px-4");
  });

  it("handles array inputs", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });

  it("handles object inputs (truthy keys)", () => {
    expect(cn({ "px-4": true, "py-2": false, "mt-4": true })).toBe(
      "px-4 mt-4",
    );
  });

  it("returns empty string for no valid inputs", () => {
    expect(cn()).toBe("");
    expect(cn(undefined)).toBe("");
    expect(cn(null)).toBe("");
    expect(cn(false)).toBe("");
  });

  it("merges complex Tailwind utility conflicts", () => {
    // bg-color conflict
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    // text-size conflict
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    // spacing conflict on same axis
    expect(cn("mt-2", "mt-4")).toBe("mt-4");
  });
});
