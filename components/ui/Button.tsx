import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger-outline" | "success-outline";

const variantClasses: Record<Variant, string> = {
  primary: "bg-wine text-onwine",
  secondary: "bg-card border border-line text-ink",
  "danger-outline": "bg-card border-[1.5px] border-rose text-rose",
  "success-outline": "bg-card border-[1.5px] border-success text-success",
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
