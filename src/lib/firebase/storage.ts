import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './client';
import { compressBlob } from '@/lib/image-compression';

// Fixed object path so a new upload overwrites the previous avatar instead of
// leaving orphaned files. The `deleteAccount` Cloud Function also removes this.
function avatarRef(uid: string) {
  return ref(storage, `users/${uid}/avatar`);
}

/**
 * Downsizes then uploads a profile picture and returns its download URL.
 * Accepts a Blob (e.g. the output of the crop tool) or a File. The image is
 * resized to a 512px max edge and re-encoded (WebP) so avatars stay small in
 * Storage.
 */
export async function uploadAvatar(uid: string, source: Blob): Promise<string> {
  const { blob, type } = await compressBlob(source, 'avatar', { maxEdge: 512 });
  const objectRef = avatarRef(uid);
  await uploadBytes(objectRef, blob, {
    contentType: type || source.type || 'image/webp',
    cacheControl: 'public,max-age=3600',
  });
  return getDownloadURL(objectRef);
}

/** Deletes the user's avatar. Silently ignores a missing object. */
export async function deleteAvatar(uid: string): Promise<void> {
  try {
    await deleteObject(avatarRef(uid));
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code !== 'storage/object-not-found') throw err;
  }
}
