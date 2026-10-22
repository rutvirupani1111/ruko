/**
 * QR decoding on the device: the native BarcodeDetector when the browser has
 * it (most Android phones), otherwise jsQR, loaded only when needed.
 */

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource | ImageBitmap | Blob): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}

let nativeDetector: Promise<BarcodeDetectorLike | null> | null = null;

function getNativeDetector(): Promise<BarcodeDetectorLike | null> {
  if (!nativeDetector) {
    nativeDetector = (async () => {
      const Ctor = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!Ctor) return null;
      try {
        const formats = (await Ctor.getSupportedFormats?.()) ?? ['qr_code'];
        if (!formats.includes('qr_code')) return null;
        return new Ctor({ formats: ['qr_code'] });
      } catch {
        return null;
      }
    })();
  }
  return nativeDetector;
}

let scratch: HTMLCanvasElement | null = null;

function toImageData(source: CanvasImageSource, width: number, height: number, maxSide = 900): ImageData | null {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  scratch ??= document.createElement('canvas');
  scratch.width = w;
  scratch.height = h;
  const ctx = scratch.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

function sizeOf(source: CanvasImageSource): { width: number; height: number } {
  if (source instanceof HTMLVideoElement) return { width: source.videoWidth, height: source.videoHeight };
  if (source instanceof HTMLImageElement) return { width: source.naturalWidth, height: source.naturalHeight };
  const s = source as { width: number | SVGAnimatedLength; height: number | SVGAnimatedLength };
  return { width: Number(s.width), height: Number(s.height) };
}

/** Decode a QR code from a video frame, bitmap or canvas. Returns null when none is found. */
export async function decodeQr(source: CanvasImageSource): Promise<string | null> {
  const { width, height } = sizeOf(source);
  if (!width || !height) return null;
  const native = await getNativeDetector();
  if (native) {
    try {
      const found = await native.detect(source);
      if (found[0]?.rawValue) return found[0].rawValue;
      return null;
    } catch {
      /* fall through to jsQR */
    }
  }
  const data = toImageData(source, width, height);
  if (!data) return null;
  const { default: jsQR } = await import('jsqr');
  const result = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
  return result?.data || null;
}

export async function decodeQrFromFile(file: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    return await decodeQr(bitmap);
  } finally {
    bitmap.close();
  }
}
