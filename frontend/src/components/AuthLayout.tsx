import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
export function AuthLayout({
  title,
  intro,
  children,
  wide = false,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="auth-shell">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className={"auth-main" + (wide ? " auth-main-wide" : "")}
      >
        <h1>{title}</h1>
        {intro && <p className="auth-intro">{intro}</p>}
        {children}
      </main>
      <Footer />
    </div>
  );
}
