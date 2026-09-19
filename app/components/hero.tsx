import type { ReactNode } from "react";

export default function Hero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="hero">
      <h1>{title}</h1>
      <p className="hero-subtitle">{subtitle}</p>
      <div className="hero-actions">{children}</div>
    </div>
  );
}
