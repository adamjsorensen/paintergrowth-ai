
import Mustache from "mustache";

export function renderPrompt(tpl: string, vars: Record<string, any>) {
  // Stringify any complex objects manually
  const safeVars = Object.fromEntries(
    Object.entries(vars).map(([k, v]) =>
      [k, typeof v === "object" ? JSON.stringify(v, null, 2) : v]
    )
  );
  const out = Mustache.render(tpl, safeVars);
  const unresolved = out.match(/{{[^}]+}}/g);
  if (unresolved?.length) {
    throw new Error(`Unresolved placeholders: ${unresolved.join(",")}`);
  }
  return out;
}
