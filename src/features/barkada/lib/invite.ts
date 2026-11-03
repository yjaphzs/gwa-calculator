// Invite codes: 8 characters with no look-alikes (no 0/O, 1/I/L). Must match
// the server's alphabet (functions/src/lib/barkada/validate.ts).
const CODE_PATTERN = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/;

/** The link friends open to join: the Leaderboard page's Barkada tab. */
export function inviteUrl(code: string, origin: string): string {
  return `${origin}/leaderboard/?join=${code}`;
}

/** A code from a pasted invite link or a typed code ("k7p2-qx9m"), or null. */
export function parseInviteCode(input: string): string | null {
  const fromLink = input.match(/[?&]join=([^&#\s]+)/i)?.[1];
  const code = (fromLink ?? input).toUpperCase().replace(/[\s-]/g, "");
  return CODE_PATTERN.test(code) ? code : null;
}

/** Easier to read aloud: "K7P2-QX9M". */
export const formatCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;
