import React from "react";

export default function ChartCard({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      <div style={{ width: "100%", height: 320, marginTop: 12 }}>
        {children}
      </div>
    </div>
  );
}
