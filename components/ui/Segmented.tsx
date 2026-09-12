export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  fullWidth = true,
  className = "",
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-[3px] rounded-full border border-line bg-card p-[3px] ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-2 text-[12.5px] font-semibold ${fullWidth ? "flex-1" : ""} ${
              active ? "bg-wine text-onwine" : "bg-transparent text-muted"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${
        active
          ? "border-wine bg-wine text-onwine"
          : "border-line2 bg-transparent text-muted"
      }`}
    >
      {children}
    </button>
  );
}
