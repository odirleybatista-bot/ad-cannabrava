import Link from "next/link";

export default function Page() {
  return (
    <main
      style={{
        padding: "22px 30px",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <Link
        href="/admin/relatorios/esportivo"
        style={{
          color: "#1763d6",
          textDecoration: "none",
          fontSize: 12,
        }}
      >
        ← Relatórios Esportivos
      </Link>

      <h1
        style={{
          margin: "6px 0 4px",
          color: "#082e69",
          fontSize: 30,
        }}
      >
        Relatório de Convocações
      </h1>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: 13,
        }}
      >
        Relatório em desenvolvimento.
      </p>
    </main>
  );
}