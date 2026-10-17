/**
 * "Harvard Biological and Biomedical Sciences (BBS) PhD", but never
 * "Rockefeller David Rockefeller Graduate Program in Bioscience".
 */
export function programLabel(short: string, name: string): string {
  return name.toLowerCase().includes(short.toLowerCase()) ? name : `${short} ${name}`;
}
