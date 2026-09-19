import type { ReactNode } from "react";

export default function FamiliesLayout({
  list,
  forms,
}: {
  list: ReactNode;
  forms: ReactNode;
}) {
  return (
    <div className="families-layout">
      <div className="families-layout-list">{list}</div>
      <div className="families-layout-forms">{forms}</div>
    </div>
  );
}
