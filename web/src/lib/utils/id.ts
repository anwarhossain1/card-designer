/** Short, collision-safe id for documents and canvas elements. */
export function createId(prefix = "el"): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);

  return `${prefix}_${random}`;
}
