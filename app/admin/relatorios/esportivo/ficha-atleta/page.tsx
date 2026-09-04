import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FichaAtletaPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("atletas")
    .select(`
      id,
      nome,
      apelido,
      modalidade,
      posicao,
      status
    `)
    .order("nome");

  const atletas = data || [];

  return (
    <main
      style={{
        padding: "22px 32px",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <Link
        href="/admin/relatorios/esportivo"
        style={{
          color: "#1763d6",
          textDecoration: "none",
          fontSize: 13,
        }}
      >
        ← Relatórios Esportivos
      </Link>

      <h1
        style={{
          color: "#082e69",
          margin: "6px 0 3px",
          fontSize: 30,
        }}
      >
        Ficha do Atleta
      </h1>

      <p
        style={{
          color: "#64748b",
          margin: "0 0 17px",
          fontSize: 13,
        }}
      >
        Selecione um atleta para consultar sua ficha completa.
      </p>

      <div
        style={{
          background: "#fff",
          border: "1px solid #dce5f0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {atletas.map((atleta) => (
          <Link
            key={atleta.id}
            href={`/admin/relatorios/esportivo/ficha-atleta/${atleta.id}`}
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(240px, 2fr) 1fr 1fr 120px",
              gap: 12,
              alignItems: "center",
              padding: "11px 16px",
              borderBottom:
                "1px solid #eef2f7",
              textDecoration: "none",
              color: "#334155",
            }}
          >
            <strong style={{ color: "#082e69" }}>
              {atleta.nome}
              {atleta.apelido
                ? ` (${atleta.apelido})`
                : ""}
            </strong>

            <span>{atleta.modalidade || "-"}</span>

            <span>{atleta.posicao || "-"}</span>

            <span
              style={{
                color: "#1763d6",
                fontWeight: 700,
                textAlign: "right",
              }}
            >
              Abrir ficha →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}