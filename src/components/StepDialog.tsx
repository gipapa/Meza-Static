import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

/** A required game step: focus stays with its choices until an action advances it. */
export default function StepDialog({ title, children, active = true }: {
  title: string;
  children: ReactNode;
  active?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!active) return;
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [active]);

  if (!active) return <>{children}</>;

  return (
    <dialog ref={ref} aria-labelledby={titleId} onCancel={e => e.preventDefault()}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg max-h-[85dvh] overflow-y-auto rounded-2xl border border-primary/40 bg-bg-dark text-text-primary p-4 sm:p-6 shadow-2xl backdrop:bg-black/80">
      <h2 id={titleId} className="font-display text-lg text-center text-primary-light mb-4">{title}</h2>
      {children}
    </dialog>
  );
}
