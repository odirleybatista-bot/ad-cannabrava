import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PartidasPage() {
  const supabase = await createClient();

  const { data: partidas, error } =
    await supabase
      .from("partidas")
      .select(`
        id,
        adversario,
        tipo,
        data_jogo,
        horario,
        local,
        mando,
        status,
        gols_cannabrava,
        gols_adversario,
        competicao_id,
        competicoes (
          nome
        )
      `)
      .order("data_jogo", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Erro ao carregar partidas:",
      error
    );
  }

  const lista = partidas || [];

  return (
    <main className="pagina">
      <header className="topo">
        <div>
          <span className="rotulo">
            GESTÃO ESPORTIVA
          </span>

          <h1>Partidas</h1>

          <p>
            Controle de jogos oficiais,
            amistosos e jogos-treino.
          </p>
        </div>

        <Link
          href="/admin/esportivo/partidas/nova"
          className="novo"
        >
          + Nova partida
        </Link>
      </header>

      <section className="resumo">
        <Resumo
          titulo="Total de partidas"
          valor={lista.length}
        />

        <Resumo
          titulo="Agendadas"
          valor={
            lista.filter(
              (p) =>
                p.status === "agendada"
            ).length
          }
        />

        <Resumo
          titulo="Finalizadas"
          valor={
            lista.filter(
              (p) =>
                p.status === "finalizada"
            ).length
          }
        />

        <Resumo
          titulo="Oficiais"
          valor={
            lista.filter(
              (p) =>
                p.tipo === "oficial"
            ).length
          }
        />
      </section>

      <section className="card">
        <div className="cabecalho-card">
          <div>
            <h2>Relação de partidas</h2>
            <p>
              Acompanhe o calendário
              esportivo da associação.
            </p>
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="vazio">
            <strong>
              Nenhuma partida cadastrada
            </strong>

            <span>
              Cadastre o primeiro jogo
              para iniciar o calendário.
            </span>
          </div>
        ) : (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Competição</th>
                  <th>Adversário</th>
                  <th>Local</th>
                  <th>Status</th>
                  <th>Placar</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {lista.map((partida: any) => (
                  <tr key={partida.id}>
                    <td>
                      {formatarData(
                        partida.data_jogo
                      )}
                      {partida.horario && (
                        <small>
                          {partida.horario}
                        </small>
                      )}
                    </td>

                    <td>
                      <Tipo
                        tipo={partida.tipo}
                      />
                    </td>

                    <td>
                      {partida.competicoes
                        ?.nome || "—"}
                    </td>

                    <td className="adversario">
                      {partida.adversario}
                    </td>

                    <td>
                      {partida.local || "—"}
                    </td>

                    <td>
                      <Status
                        status={
                          partida.status
                        }
                      />
                    </td>

                    <td>
                      {partida.status ===
                      "finalizada"
                        ? `${partida.gols_cannabrava ?? 0} x ${partida.gols_adversario ?? 0}`
                        : "—"}
                    </td>

                    <td>
                      <div className="acoes">
                        <Link
                          href={`/admin/esportivo/partidas/${partida.id}`}
                        >
                          Abrir
                        </Link>

                        <Link
                          href={`/admin/esportivo/partidas/${partida.id}/convocacao`}
                        >
                          Convocação
                        </Link>

                        <Link
                          href={`/admin/esportivo/partidas/${partida.id}/sumula`}
                        >
                          Súmula
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 22px 24px 40px;
        }

        .topo {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 18px;
        }

        .rotulo {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .topo h1 {
          margin: 4px 0;
          color: #082e69;
          font-size: 30px;
        }

        .topo p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .novo {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          padding: 0 15px;
          border-radius: 8px;
          background: #082e69;
          color: white;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .resumo {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 9px;
        }

        .resumo-item {
          padding: 14px;
          border: 1px solid #dce5f0;
          border-radius: 11px;
          background: white;
        }

        .resumo-item span {
          color: #94a3b8;
          font-size: 7px;
          font-weight: 900;
        }

        .resumo-item strong {
          display: block;
          margin-top: 4px;
          color: #082e69;
          font-size: 22px;
        }

        .card {
          margin-top: 12px;
          padding: 16px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: white;
        }

        .cabecalho-card h2 {
          margin: 0;
          color: #082e69;
          font-size: 17px;
        }

        .cabecalho-card p {
          margin: 3px 0 14px;
          color: #94a3b8;
          font-size: 9px;
        }

        .tabela-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          padding: 9px 8px;
          border-bottom: 2px solid #dce5f0;
          color: #64748b;
          font-size: 7px;
          text-align: left;
          text-transform: uppercase;
        }

        td {
          padding: 10px 8px;
          border-bottom: 1px solid #edf1f5;
          color: #475569;
          font-size: 9px;
        }

        td small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 7px;
        }

        .adversario {
          color: #082e69;
          font-weight: 800;
        }

        .acoes {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .acoes a {
          padding: 5px 7px;
          border-radius: 6px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 7px;
          font-weight: 900;
          text-decoration: none;
        }

        .vazio {
          padding: 40px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          text-align: center;
        }

        .vazio strong {
          display: block;
          color: #64748b;
        }

        .vazio span {
          display: block;
          margin-top: 4px;
          color: #94a3b8;
          font-size: 9px;
        }

        @media(max-width:800px) {
          .pagina {
            padding: 14px 10px 30px;
          }

          .topo {
            align-items: stretch;
            flex-direction: column;
          }

          .resumo {
            grid-template-columns:
              repeat(2,1fr);
          }
        }
      `}</style>
    </main>
  );
}

function Resumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div className="resumo-item">
      <span>
        {titulo.toUpperCase()}
      </span>

      <strong>{valor}</strong>
    </div>
  );
}

function Tipo({
  tipo,
}: {
  tipo: string;
}) {
  const mapa: Record<
    string,
    string
  > = {
    oficial: "Jogo Oficial",
    amistoso: "Amistoso",
    jogo_treino: "Jogo-treino",
  };

  return (
    <span>
      {mapa[tipo] || tipo}
    </span>
  );
}

function Status({
  status,
}: {
  status: string;
}) {
  const mapa: Record<
    string,
    string
  > = {
    agendada: "Agendada",
    em_andamento: "Em andamento",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  return (
    <span>
      {mapa[status] || status}
    </span>
  );
}

function formatarData(
  data: string | null
) {
  if (!data) {
    return "—";
  }

  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}