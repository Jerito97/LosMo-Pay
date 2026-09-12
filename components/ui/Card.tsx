export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function WineCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] bg-wine p-5 text-onwine shadow-[0_8px_22px_rgba(43,16,21,0.14)] ${className}`}
    >
      {children}
    </div>
  );
}
