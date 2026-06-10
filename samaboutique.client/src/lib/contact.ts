/** Détection intelligente téléphone / email (style Jumia, adapté Sénégal). */

export type ContactKind = "empty" | "phone" | "email" | "foreign";

export function detectContactKind(input: string): ContactKind {
  const v = input.trim();
  if (!v) return "empty";
  if (v.includes("@") || /[a-zA-Z]/.test(v)) return "email";
  if (v.startsWith("+")) return v.startsWith("+221") ? "phone" : "foreign";
  return "phone"; // que des chiffres → numéro local
}

/** Garde les 9 chiffres nationaux (retire +221 / 221 éventuel). */
export function phoneDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("221") && d.length >= 11) d = d.slice(3);
  return d.slice(0, 9);
}

/** Format d'affichage XX XXX XX XX. */
export function formatPhone(input: string): string {
  const d = phoneDigits(input);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.join(" ");
}

export const isValidSnPhone = (digits: string) => /^(70|75|76|77|78)\d{7}$/.test(digits);

export const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Valeur "contact" envoyée au backend (+221XXXXXXXXX ou email minuscule). */
export function contactValue(input: string): string {
  const kind = detectContactKind(input);
  if (kind === "phone") return "+221" + phoneDigits(input);
  return input.trim().toLowerCase();
}

/** Vrai si le contact saisi est complet et valide. */
export function isContactValid(input: string): boolean {
  const kind = detectContactKind(input);
  if (kind === "phone") return isValidSnPhone(phoneDigits(input));
  if (kind === "email") return isValidEmail(input);
  return false;
}
