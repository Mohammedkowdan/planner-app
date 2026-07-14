/**
 * Normalizes Arabic strings for consistent matching of Governorates and Districts.
 * Handles spacing, Alef variants, Yaa variants, and punctuation.
 */
export function normalizeArabicString(str: string | null | undefined): string {
  if (!str) return "";

  let normalized = str.trim();

  // 1. Remove extra internal spaces
  normalized = normalized.replace(/\s+/g, " ");

  // 2. Standardize Alef variants (U+0622, U+0623, U+0625 -> U+0627)
  normalized = normalized.replace(/[\u0622\u0623\u0625]/g, "\u0627");

  // 3. Standardize Yaa/Alif Maqsura (U+0649 -> U+064A)
  // Usually in Yemeni names, "ى" and "ي" are used interchangeably at the end.
  normalized = normalized.replace(/\u0649/g, "\u064A");

  // 4. Standardize Taa Marbuta (U+0629 -> U+0647)
  // Sometimes "ة" and "ه" are confused.
  normalized = normalized.replace(/\u0629/g, "\u0647");

  // 5. Remove Tatweel (Kashida)
  normalized = normalized.replace(/\u0640/g, "");

  // 6. Remove Harakat (Vowels/Diacritics)
  normalized = normalized.replace(/[\u064B-\u0652]/g, "");

  return normalized;
}

/**
 * Specifically for matching location names like "حضرموت" or "أمانة العاصمة"
 */
export function matchLocationName(name1: string, name2: string): boolean {
  return normalizeArabicString(name1) === normalizeArabicString(name2);
}
