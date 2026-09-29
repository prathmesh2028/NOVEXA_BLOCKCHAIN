export function formatDate(iso: string): string {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " • " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
}

export function shortHash(hash: string, chars = 6): string {
  if (!hash) return "—";
  if (hash.length <= chars * 2 + 3) return hash;
  return hash.slice(0, chars) + "..." + hash.slice(-4);
}
