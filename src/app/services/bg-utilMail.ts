import { ParsedAddress } from "../modeles/BgMail";


/**
 * Parse une seule adresse comme :
 *  - "Display Name <user@example.com>"
 *  - 'Display Name (user@example.com)'
 *  - "user@example.com"
 *  - '"Quoted, Name" <user@example.com>'
 *
 * Retourne ParsedAddress ou null si aucun email n'est trouvé.
 */
export function parseSingleAddress(input: string | null | undefined): ParsedAddress | null {
  if (!input) return null;

  const s = input.trim();
  if (!s) return null;

  const stripQuotes = (str: string) => str.replace(/(^['"]|['"]$)/g, '').trim();

  // 1) Forme la plus courante : "Name <email>"
  const angleMatch = s.match(/^(.*?)<\s*([^>]+)\s*>$/);
  if (angleMatch) {
    const rawName = angleMatch[1].trim();
    const name = rawName ? stripQuotes(rawName) : null;
    const email = angleMatch[2].trim();
    return { name, email };
  }

  // 2) Variante : "Name (email)"
  const parenMatch = s.match(/^(.*?)\(\s*([^)\s]+@[^)\s]+)\s*\)$/);
  if (parenMatch) {
    const rawName = parenMatch[1].trim();
    const name = rawName ? stripQuotes(rawName) : null;
    const email = parenMatch[2].trim();
    return { name, email };
  }

  // 3) Email seule (éventuellement entourée de <>)
  const emailOnly = s.match(/^<?\s*([^<>\s]+@[^<>\s]+)\s>?$/);
  if (emailOnly) {
    return { name: null, email: emailOnly[1].trim() };
  }

  // 4) Tenter d'extraire le premier token qui ressemble à une adresse email n'importe où dans la chaîne
  const anyEmail = s.match(/([^\s<>()]+@[^\s<>()]+)/);
  if (anyEmail) {
    const email = anyEmail[1].trim();
    // retirer l'email de la chaîne pour obtenir un nom approximatif
    let nameCandidate: string | null = s.replace(anyEmail[0], '').replace(/[<>]/g, '').trim();
    nameCandidate = nameCandidate ? stripQuotes(nameCandidate) : null;
    return { name: nameCandidate, email };
  }

  // Aucun email reconnu
  return null;
}