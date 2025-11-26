import clsx from "clsx";

export default function Card({
  title,
  description,
  children,
  className = "",
  headerRight
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl",
        "bg-white/5",
        "backdrop-blur-xl",
        "border border-white/10",
        "shadow-[0_0_25px_-8px_rgba(0,0,0,0.8)]",
        "px-4 py-3 md:px-5 md:py-4",
        "text-slate-100",
        className
      )}
    >
      {(title || description || headerRight) && (
        <header className="mb-2 flex items-start justify-between gap-2">
          <div>
            {title && (
              <h2 className="text-sm md:text-base font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </header>
      )}

      {children}
    </section>
  );
}