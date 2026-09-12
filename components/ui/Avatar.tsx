import { avatarColors } from "@/lib/avatar";
import { initials } from "@/lib/format";

export function Avatar({
  name,
  userId,
  size = 40,
  className = "",
}: {
  name: string;
  userId: string;
  size?: number;
  className?: string;
}) {
  const { bg, fg } = avatarColors(userId);
  return (
    <span
      className={`flex flex-none items-center justify-center rounded-full font-bold ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.round(size * 0.34),
      }}
    >
      {initials(name)}
    </span>
  );
}
