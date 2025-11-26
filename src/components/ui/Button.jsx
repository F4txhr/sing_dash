export default function Button({
  children,
  variant = "solid",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium transition shadow-sm";
  const sizes =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  const solid =
    "bg-sky-500/90 hover:bg-sky-400 active:bg-sky-600 text-slate-950";
  const ghost =
    "border border-slate-700/80 text-slate-200 hover:border-slate-500 hover:bg-slate-900/70";

  const variantClass = variant === "solid" ? solid : ghost;

  return (
    <button
      {...props}
      className={`${base} ${sizes} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}