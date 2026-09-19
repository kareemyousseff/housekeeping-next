import type { ReactNode } from "react";

export default function MapLayout({
  title,
  map,
  live,
  history,
}: {
  title: string;
  map: ReactNode;
  live: ReactNode;
  history: ReactNode;
}) {
  return (
    <div className="map-layout">
      <h1 className="map-layout-title">{title}</h1>
      <div className="map-layout-map">{map}</div>
      <div className="map-layout-live">{live}</div>
      <div className="map-layout-history">{history}</div>
    </div>
  );
}
