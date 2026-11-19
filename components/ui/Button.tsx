import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "success";

const variantClasses: Record<Variant, string> = {
  primary: "bg-wine text-onwine",
  secondary: "bg-card border border-line text-ink",
  danger: "bg-rose text-onrose",
  success: "bg-success text-onsuccess",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`w-full cursor-pointer rounded-[14px] px-4 py-[17px] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
