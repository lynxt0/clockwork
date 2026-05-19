import { getCurrentWindow } from "@tauri-apps/api/window";

type Props = {
  title?: string;
  onBack?: () => void;
};

export function TitleBar({ title, onBack }: Props) {
  const win = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="relative flex h-10 shrink-0 items-center justify-between border-b border-border/60 bg-bg/80 px-2 backdrop-blur"
    >
      <div className="flex items-center gap-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text"
            aria-label="Back"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div
            data-tauri-drag-region
            className="ml-2 flex items-center gap-1.5"
          >
            <span
              data-tauri-drag-region
              className="h-2 w-2 rounded-full bg-accent"
            />
            <span
              data-tauri-drag-region
              className="text-xs font-semibold tracking-wide text-text"
            >
              CLOCKWORK
            </span>
          </div>
        )}
      </div>

      {title && (
        <div
          data-tauri-drag-region
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-text-muted"
        >
          {title}
        </div>
      )}

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => win.minimize()}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:bg-bg-hover hover:text-text"
          aria-label="Minimize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="1" y="5" width="8" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => win.hide()}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:bg-bg-hover hover:text-text"
          aria-label="Hide to tray"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M1 1l8 8M9 1l-8 8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
