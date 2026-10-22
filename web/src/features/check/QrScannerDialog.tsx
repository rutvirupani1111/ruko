import { useEffect, useRef, useState } from 'react';
import { CameraOff, ImageUp, ScanQrCode, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { decodeQr, decodeQrFromFile } from './qr';
import { checkStrings } from './strings';

type Status = 'starting' | 'scanning' | 'denied' | 'nocamera' | 'notfound' | 'reading';

interface Props {
  onClose: () => void;
  onResult: (text: string) => void;
}

/** Full-screen camera QR scanner in a native <dialog>. Lazy-loaded on first use. */
export default function QrScannerDialog({ onClose, onResult }: Props) {
  const t = useT(checkStrings);
  const c = useT(common);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('starting');
  const done = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let cancelled = false;

    const finish = (text: string) => {
      if (done.current) return;
      done.current = true;
      onResult(text);
    };

    const scan = async () => {
      const video = videoRef.current;
      if (cancelled || !video || done.current) return;
      if (video.readyState >= 2) {
        const text = await decodeQr(video).catch(() => null);
        if (text) {
          finish(text);
          return;
        }
      }
      timer = window.setTimeout(scan, 180);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('nocamera');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        });
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play().catch(() => undefined);
        setStatus('scanning');
        void scan();
      } catch (err) {
        const name = (err as DOMException)?.name;
        setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'nocamera');
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onResult]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setStatus('reading');
    const text = await decodeQrFromFile(file).catch(() => null);
    if (text) {
      done.current = true;
      onResult(text);
    } else {
      setStatus('notfound');
    }
  };

  const message =
    status === 'denied'
      ? t.qr.denied
      : status === 'nocamera'
        ? t.qr.noCamera
        : status === 'notfound'
          ? t.qr.notFound
          : status === 'starting'
            ? t.qr.starting
            : t.qr.hint;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="qr-title"
      className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-paper sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-lg sm:rounded-3xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <h2 id="qr-title" className="display flex items-center gap-2 text-xl">
            <ScanQrCode aria-hidden="true" className="size-6 text-saffron" />
            {t.qr.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label={c.actions.close}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="relative mx-5 aspect-square overflow-hidden rounded-3xl bg-black sm:mx-6">
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
          {status === 'scanning' ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-[14%]">
              {['top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl'].map(
                (pos) => (
                  <span key={pos} className={`absolute size-10 border-saffron ${pos}`} />
                ),
              )}
              <span className="qr-line absolute inset-x-2 top-1/2 h-0.5 rounded-full bg-saffron/80" />
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              {status === 'denied' || status === 'nocamera' ? <CameraOff aria-hidden="true" className="size-12 text-white/50" /> : null}
            </div>
          )}
        </div>

        <p role="status" className="mx-5 mt-4 text-center text-[0.98rem] leading-relaxed text-paper/85 sm:mx-6">
          {message}
        </p>

        <div className="mt-auto px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <Button variant="primary" size="lg" block onClick={() => fileRef.current?.click()}>
            <ImageUp aria-hidden="true" />
            {t.qr.fromImage}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
