/**
 * Client-side preparation of a reference image for the AI Prompt Assistant.
 *
 * Images are downscaled and re-encoded as JPEG before upload:
 * - Claude resizes anything above ~1568 px on the long edge anyway, so larger
 *   images only add latency and tokens.
 * - Vercel caps serverless request bodies at 4.5 MB; a 1568 px JPEG stays far below it.
 */

export interface ImageAttachment {
  mediaType: 'image/jpeg';
  /** Base64 payload without the data-URL prefix (what the Anthropic API expects). */
  data: string;
  /** Full data URL, used for thumbnails in the chat. */
  dataUrl: string;
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAX_EDGE = 1568;
const JPEG_QUALITY = 0.85;
const MAX_INPUT_BYTES = 20 * 1024 * 1024;

export class ImageAttachmentError extends Error {}

async function decode(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fall through to <img> decoding (older Safari).
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareImage(file: File): Promise<ImageAttachment> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageAttachmentError('Use a JPG, PNG, WebP or GIF image.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageAttachmentError('Image is larger than 20 MB.');
  }

  let source: Awaited<ReturnType<typeof decode>>;
  try {
    source = await decode(file);
  } catch {
    throw new ImageAttachmentError('Could not read this image.');
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageAttachmentError('Could not process this image.');

  // JPEG has no alpha: flatten transparent PNG/WebP onto white instead of black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  if ('close' in source && typeof source.close === 'function') source.close();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  const data = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return { mediaType: 'image/jpeg', data, dataUrl };
}
