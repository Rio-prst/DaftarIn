import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
export function WorkspaceLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#142C4B]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar breadcrumbs={[title]} />
        <main id="main-content" tabIndex={-1} className="workspace-content">
          <div className="section-heading">
            <div>
              <h1>{title}</h1>
              {description && (
                <p className="workspace-description">{description}</p>
              )}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
