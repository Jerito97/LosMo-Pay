"use client";

export function Fab({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div className="pointer-events-none relative w-full max-w-[430px]">
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="pointer-events-auto absolute right-5 flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-full bg-wine text-onwine shadow-[0_10px_26px_rgba(43,16,21,0.34)] [animation:upIn_.22s_cubic-bezier(.2,.8,.3,1)]"
          style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
