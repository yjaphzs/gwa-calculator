import { randomInt } from "node:crypto";
import {
  FieldPath,
  FieldValue,
  getFirestore,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

import type { BarkadaDoc, StoredSemester } from "./types";
import { CODE_ALPHABET, CODE_LENGTH } from "./validate";

export const barkadas = () => getFirestore().collection("barkadas");

/** The group an invite code belongs to, or null. */
export async function findByCode(code: string): Promise<QueryDocumentSnapshot | null> {
  const snap = await barkadas().where("code", "==", code).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

/** Every group the user is in (at most 5). */
export async function groupsOf(uid: string): Promise<QueryDocumentSnapshot[]> {
  return (await barkadas().where("memberUids", "array-contains", uid).get()).docs;
}

/** A group the user belongs to, or a not-found error (also for groups they've left). */
export async function memberGroup(groupId: string, uid: string): Promise<DocumentSnapshot> {
  const snap = await barkadas().doc(groupId).get();
  const group = snap.data() as BarkadaDoc | undefined;
  if (!group?.memberUids?.includes(uid)) throw new HttpsError("not-found", "You're not in that barkada.");
  return snap;
}

/** A fresh invite code no other group uses. */
export async function uniqueCode(): Promise<string> {
  for (let tries = 0; tries < 5; tries++) {
    const code = Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
    if (!(await findByCode(code))) return code;
  }
  throw new HttpsError("internal", "Couldn't make an invite code. Try again.");
}

/** The user's saved semesters (where every barkada entry comes from). */
export async function semestersOf(uid: string): Promise<StoredSemester[]> {
  const snap = await getFirestore().doc(`users/${uid}/calculator/state`).get();
  const semesters = snap.data()?.semesters;
  return Array.isArray(semesters) ? semesters : [];
}

const joinedMillis = (group: BarkadaDoc, uid: string) =>
  (group.members?.[uid]?.joinedAt as Timestamp | undefined)?.toMillis?.() ?? 0;

/**
 * Who owns the group after `leaving` goes: the same owner, or (when the owner
 * leaves) the member who joined earliest. Null when nobody is left.
 */
export function nextOwner(group: BarkadaDoc, leaving: string): string | null {
  const rest = group.memberUids.filter((uid) => uid !== leaving);
  if (!rest.length) return null;
  if (group.ownerUid !== leaving) return group.ownerUid;
  return [...rest].sort((a, b) => joinedMillis(group, a) - joinedMillis(group, b))[0];
}

/** Takes a member out of a group, handing it on or deleting it when they were the last one. */
export async function removeMember(groupId: string, uid: string): Promise<void> {
  const ref = barkadas().doc(groupId);
  await getFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const group = snap.data() as BarkadaDoc | undefined;
    if (!group?.memberUids?.includes(uid)) return;
    const owner = nextOwner(group, uid);
    if (!owner) {
      tx.delete(ref);
      return;
    }
    tx.update(
      ref,
      "memberUids", FieldValue.arrayRemove(uid),
      new FieldPath("members", uid), FieldValue.delete(),
      "ownerUid", owner,
      "updatedAt", FieldValue.serverTimestamp(),
    );
  });
}

/** Removes the user from every group (account deletion). */
export async function leaveAllBarkadas(uid: string): Promise<void> {
  for (const snap of await groupsOf(uid)) await removeMember(snap.id, uid);
}
