/* ────────────────────────────────────────────────────────────────────
 *  Browser-side image helpers for custom character art.
 *
 *  processImageFile   validate + downscale an uploaded file to a small
 *                     data: URL suitable for localStorage (phones produce
 *                     multi-MB photos; we keep ≤ ~190 KB).
 *  probeImageUrl      check a remote URL loads, and make a CORS-safe cached
 *                     copy when the host allows it.
 *  loadArtBitmap      decode a src into an *untainted* canvas for Phaser
 *                     (WebGL refuses tainted sources). Memoised; resolves to
 *                     null on any failure or timeout so callers fall back to
 *                     the emoji instead of stalling.
 *  ──────────────────────────────────────────────────────────────────── */

import { MAX_DATA_URL_LENGTH } from './characterImages';

export const MAX_UPLOAD_FILE_BYTES = 15 * 1024 * 1024;
/** Longest side of stored images. Enough for the 2× cinematic close-ups. */
export const STORED_MAX_SIDE = 384;
/** Longest side of textures handed to Phaser. */
const TEXTURE_MAX_SIDE = 512;
const LOAD_TIMEOUT_MS = 10_000;

export class ImageError extends Error {}

function loadImage(src: string, opts: { cors: boolean; timeoutMs?: number }): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let done = false;
    const timer = window.setTimeout(() => finish(new ImageError('圖片載入逾時')), opts.timeoutMs ?? LOAD_TIMEOUT_MS);
    function finish(err?: Error) {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      img.onload = img.onerror = null;
      if (err) {
        img.src = '';
        reject(err);
      } else resolve(img);
    }
    if (opts.cors) img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) finish(new ImageError('無法讀取圖片'));
      else finish();
    };
    img.onerror = () => finish(new ImageError('無法載入圖片'));
    img.src = src;
  });
}

/** Draw `img` into a canvas no larger than `maxSide`. Throws if tainted. */
function toCanvas(img: CanvasImageSource & { naturalWidth?: number; naturalHeight?: number; width: number; height: number }, maxSide: number): HTMLCanvasElement {
  const w0 = img.naturalWidth || img.width;
  const h0 = img.naturalHeight || img.height;
  const k = Math.min(1, maxSide / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k));
  const h = Math.max(1, Math.round(h0 * k));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageError('無法處理圖片');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  // Throws SecurityError when the source is cross-origin without CORS.
  ctx.getImageData(0, 0, 1, 1);
  return canvas;
}

function hasTransparency(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 16) if (data[i] < 250) return true;
  return false;
}

/**
 * Encode to the smallest acceptable data: URL: WebP (keeps alpha) → PNG for
 * transparent art → JPEG, shrinking until it fits MAX_DATA_URL_LENGTH.
 */
function encodeForStorage(source: HTMLCanvasElement): string {
  const alpha = hasTransparency(source);
  let side = Math.max(source.width, source.height);
  for (let attempt = 0; attempt < 6; attempt++) {
    const k = Math.min(1, side / Math.max(source.width, source.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(source.width * k));
    c.height = Math.max(1, Math.round(source.height * k));
    const ctx = c.getContext('2d');
    if (!ctx) break;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, c.width, c.height);

    const webp = c.toDataURL('image/webp', 0.85);
    if (webp.startsWith('data:image/webp') && webp.length <= MAX_DATA_URL_LENGTH) return webp;
    if (alpha) {
      const png = c.toDataURL('image/png');
      if (png.length <= MAX_DATA_URL_LENGTH) return png;
    }
    // JPEG has no alpha: paint a dark backdrop matching the app theme.
    const j = document.createElement('canvas');
    j.width = c.width;
    j.height = c.height;
    const jctx = j.getContext('2d');
    if (jctx) {
      jctx.fillStyle = '#0f0f23';
      jctx.fillRect(0, 0, j.width, j.height);
      jctx.drawImage(c, 0, 0);
      const jpg = j.toDataURL('image/jpeg', 0.82);
      if (jpg.length <= MAX_DATA_URL_LENGTH) return jpg;
    }
    side = Math.round(side * 0.75);
  }
  throw new ImageError('圖片太大，無法壓縮到可儲存的大小');
}

/** Validate an uploaded file and return a compact data: URL. */
export async function processImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new ImageError('請選擇 PNG、JPEG、WebP 或 GIF 圖片');
  }
  if (file.size > MAX_UPLOAD_FILE_BYTES) throw new ImageError('圖片檔案超過 15 MB');
  const url = URL.createObjectURL(file);
  try {
    let img: HTMLImageElement;
    try {
      img = await loadImage(url, { cors: false });
    } catch {
      throw new ImageError('無法讀取這個圖片格式（例如 HEIC），請改用 PNG 或 JPEG');
    }
    if (Math.min(img.naturalWidth, img.naturalHeight) < 16) throw new ImageError('圖片尺寸太小');
    return encodeForStorage(toCanvas(img, STORED_MAX_SIDE));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface UrlProbe {
  /** Displayable in an <img>. */
  loaded: boolean;
  /** CORS-safe downscaled copy (usable by Canvas/WebGL) when allowed. */
  cache?: string;
}

/** Check a remote image and try to make a CORS-safe cached copy. */
export async function probeImageUrl(url: string): Promise<UrlProbe> {
  try {
    const img = await loadImage(url, { cors: true });
    try {
      return { loaded: true, cache: encodeForStorage(toCanvas(img, STORED_MAX_SIDE)) };
    } catch {
      return { loaded: true };
    }
  } catch {
    // CORS refused (or a real failure): see whether it displays at all.
  }
  try {
    await loadImage(url, { cors: false });
    return { loaded: true };
  } catch {
    return { loaded: false };
  }
}

/* ── Phaser textures ── */

const bitmapPromises = new Map<string, Promise<HTMLCanvasElement | null>>();
const bitmapResults = new Map<string, HTMLCanvasElement | null>();

/**
 * Untainted canvas for `src`, or null when it cannot be used by WebGL
 * (load error, CORS refused, timeout). Never rejects.
 */
export function loadArtBitmap(src: string): Promise<HTMLCanvasElement | null> {
  let p = bitmapPromises.get(src);
  if (!p) {
    p = loadImage(src, { cors: !src.startsWith('data:') })
      .then(img => toCanvas(img, TEXTURE_MAX_SIDE))
      .catch(() => null)
      .then(canvas => {
        bitmapResults.set(src, canvas);
        return canvas;
      });
    bitmapPromises.set(src, p);
  }
  return p;
}

/** Synchronous lookup: canvas, null (failed) or undefined (not loaded yet). */
export function peekArtBitmap(src: string): HTMLCanvasElement | null | undefined {
  return bitmapResults.has(src) ? bitmapResults.get(src) : undefined;
}
