import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function idade(data: string | null) {
  if (!data) return "-";

  const nascimento = new Date(`${data}T00:00:00`);
  const hoje = new Date();

  let resultado =
    hoje.getFullYear() - nascimento.getFullYear();

  const mes =
    hoje.getMonth() - nascimento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 &&
      hoje.getDate() < nascimento.getDate())
  ) {
    resultado--;
  }

  return `${resultado} anos`;
}

export default async function AtletasAtivosPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("atletas")
    .select(`
      id,
      nome,
      apelido,
      data_nascimento,
      modalidade,
      posicao,
      numero_camisa,
      telefone,
      email,
      status
    `)
    .eq("status", "ativo")
    .order("nome");

  const atletas = data || [];

  return (
    <main
      style={{
        padding: "22px 32px",
        maxWidth: 1700,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          marginBottom: 16,
        }}
      >
        <div>
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
              margin: "5px 0 3px",
              color: "#082e69",
              fontSize: 30,
            }}
          >
            Atletas Ativos
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            {atletas.length} atleta
            {atletas.length === 1 ? "" : "s"} ativo
            {atletas.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          onClick={undefined}
          style={{
            display: "none",
          }}
        />
      </div>

      {error ? (
        <div
          style={{
            padding: 20,
            background: "#fff1f2",
            color: "#b91c1c",
            borderRadius: 12,
          }}
        >
          Não foi possível carregar o relatório.
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #dce5f0",
            borderRadius: 12,
            overflow: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 900,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f7f9fc",
                  color: "#475569",
                }}
              >
                {[
                  "Atleta",
                  "Modalidade",
                  "Posição",
                  "Camisa",
                  "Idade",
                  "Telefone",
                  "Ações",
                ].map((item) => (
                  <th
                    key={item}
                    style={{
                      padding: "10px 13px",
                      textAlign: "left",
                      fontSize: 12,
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {atletas.map((atleta) => (
                <tr key={atleta.id}>
                  <td style={td}>
                    <strong>{atleta.nome}</strong>
                    {atleta.apelido && (
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: 11,
                        }}
                      >
                        {atleta.apelido}
                      </div>
                    )}
                  </td>

                  <td style={td}>
                    {atleta.modalidade || "-"}
                  </td>

                  <td style={td}>
                    {atleta.posicao || "-"}
                  </td>

                  <td style={td}>
                    {atleta.numero_camisa || "-"}
                  </td>

                  <td style={td}>
                    {idade(atleta.data_nascimento)}
                  </td>

                  <td style={td}>
                    {atleta.telefone || "-"}
                  </td>

                  <td style={td}>
                    <Link
                      href={`/admin/relatorios/esportivo/ficha-atleta/${atleta.id}`}
                      style={{
                        color: "#1763d6",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}

              {atletas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 35,
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Nenhum atleta ativo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const td = {
  padding: "10px 13px",
  borderBottom: "1px solid #eef2f7",
  color: "#334155",
  fontSize: 13,
};