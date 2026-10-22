import type Tesseract from 'tesseract.js';

/**
 * On-device OCR for screenshots (English + Hindi), loaded only when someone
 * picks an image. The Tesseract worker and WebAssembly core are self-hosted
 * under /ocr/; only the language data comes from jsDelivr the first time and
 * is then cached in IndexedDB, so later reads work offline.
 */

export interface OcrProgress {
  stage: 'preparing' | 'reading';
  /** 0..1 */
  progress: number;
}

type Listener = (p: OcrProgress) => void;

let workerPromise: Promise<Tesseract.Worker> | null = null;
let listener: Listener | null = null;
let idleTimer: number | undefined;

function absolute(path: string): string {
  return new URL(path, window.location.href).href;
}

async function getWorker(): Promise<Tesseract.Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      // The prebuilt ESM bundle is ~11 KB gzip and avoids bundling Node-only shims.
      const { default: tesseract } = await import('tesseract.js/dist/tesseract.esm.min.js');
      return tesseract.createWorker(['eng', 'hin'], 1, {
        workerPath: absolute('/ocr/worker.min.js'),
        corePath: absolute('/ocr/'),
        workerBlobURL: false,
        logger: (m: Tesseract.LoggerMessage) => {
          const reading = m.status === 'recognizing text';
          listener?.({ stage: reading ? 'reading' : 'preparing', progress: typeof m.progress === 'number' ? m.progress : 0 });
        },
      });
    })();
    workerPromise.catch(() => {
      workerPromise = null;
    });
  }
  return workerPromise;
}

/** Free the ~100 MB OCR worker after a minute of not being used. */
function scheduleIdleShutdown() {
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(async () => {
    const pending = workerPromise;
    workerPromise = null;
    if (pending) (await pending.catch(() => null))?.terminate();
  }, 60_000);
}

export function cleanOcrText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function readImageText(image: Blob, onProgress?: Listener): Promise<string> {
  window.clearTimeout(idleTimer);
  listener = onProgress ?? null;
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(image);
    return cleanOcrText(data.text ?? '');
  } finally {
    listener = null;
    scheduleIdleShutdown();
  }
}
