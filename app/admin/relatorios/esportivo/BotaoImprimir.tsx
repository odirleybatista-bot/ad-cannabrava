"use client";

export default function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        height: "38px",
        padding: "0 16px",
        border: "1px solid #b9c8dc",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#082e69",
        fontWeight: 700,
        fontSize: "13px",
        cursor: "pointer",
      }}
    >
      Imprimir
    </button>
  );
}