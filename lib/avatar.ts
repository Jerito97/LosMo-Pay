// Paleta reutilizada del prototipo (P en LosMo Pay.dc.html): pares bg/fg que
// combinan con --wine/--rose/--paper en ambos temas.
const PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: "#4a0e1a", fg: "#f7e9e4" },
  { bg: "#a83243", fg: "#ffffff" },
  { bg: "#7e2230", fg: "#ffffff" },
  { bg: "#e2cfc6", fg: "#3a0b12" },
  { bg: "#2b1015", fg: "#f7e9e4" },
  { bg: "#c9a05e", fg: "#2b1015" },
  { bg: "#d8c0b6", fg: "#3a0b12" },
  { bg: "#6b1622", fg: "#f7e9e4" },
  { bg: "#b06a66", fg: "#ffffff" },
  { bg: "#3b1119", fg: "#f7e9e4" },
  { bg: "#e8c9c4", fg: "#3a0b12" },
  { bg: "#8c2b3a", fg: "#ffffff" },
  { bg: "#cdb4a8", fg: "#2b1015" },
  { bg: "#571421", fg: "#f7e9e4" },
];

export function avatarColors(userId: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
