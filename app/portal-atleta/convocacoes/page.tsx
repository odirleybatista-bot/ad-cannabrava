import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function ConvocacoesAtletaPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  if (!usuario.atletaId) {
    redirect("/portal-atleta/dados");
  }

  const supabase = await createClient();

  const { data: registros, error } =
    await supabase
      .from("convocacao_atletas")
      .select(`
        id,
        convocacao_id,
        resposta,
        resposta_em,
        observacao_atleta
      `)
      .eq("atleta_id", usuario.atletaId)
      .order("convocado_em", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Erro ao carregar convocações:",
      error
    );
  }

  const idsConvocacoes = [
    ...new Set(
      (registros || [])
        .map((item: any) => item.convocacao_id)
        .filter(Boolean)
    ),
  ];

  let convocacoes: any[] = [];

  if (idsConvocacoes.length > 0) {
    const { data } =
      await supabase
        .from("convocacoes")
        .select(`
          id,
          partida_id,
          status,
          mensagem,
          limite_confirmacao,
          publicada_em,
          encerrada_em
        `)
        .in("id", idsConvocacoes);

    convocacoes = data || [];
  }

  const idsPartidas = [
    ...new Set(
      convocacoes
        .map((item: any) => item.partida_id)
        .filter(Boolean)
    ),
  ];

  let partidas: any[] = [];

  if (idsPartidas.length > 0) {
    const { data } =
      await supabase
        .from("partidas")
        .select(`
          id,
          adversario,
          tipo,
          modalidade,
          data_jogo,
          horario,
          local,
          cidade,
          status
        `)
        .in("id", idsPartidas);

    partidas = data || [];
  }

  const lista =
    (registros || [])
      .map((registro: any) => {
        const convocacao =
          convocacoes.find(
            (item: any) =>
              item.id === registro.convocacao_id
          );

        if (!convocacao) {
          return null;
        }

        const partida =
          partidas.find(
            (item: any) =>
              item.id === convocacao.partida_id
          );

        if (!partida) {
          return null;
        }

        return {
          ...registro,
          convocacao,
          partida,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) =>
        String(b.partida.data_jogo)
          .localeCompare(
            String(a.partida.data_jogo)
          )
      );

  const abertas =
    lista.filter(
      (item: any) =>
        item.convocacao.status === "aberta"
    ).length;

  const confirmadas =
    lista.filter(
      (item: any) =>
        item.resposta === "confirmado"
    ).length;

  const pendentes =
    lista.filter(
      (item: any) =>
        item.resposta === "pendente"
    ).length;

  return (
    <main className="pagina">
      <div className="topo">
        <div>
          <Link
            href="/portal-atleta"
            className="voltar"
          >
            ← Voltar ao portal
          </Link>

          <span className="rotulo">
            PORTAL DO ATLETA
          </span>

          <h1>Minhas Convocações</h1>

          <p>
            Consulte as partidas para as quais você
            foi convocado e informe sua disponibilidade.
          </p>
        </div>
      </div>

      <section className="indicadores">
        <Indicador
          titulo="Total"
          valor={lista.length}
        />

        <Indicador
          titulo="Abertas"
          valor={abertas}
        />

        <Indicador
          titulo="Confirmadas"
          valor={confirmadas}
        />

        <Indicador
          titulo="Pendentes"
          valor={pendentes}
        />
      </section>

      <section className="card">
        <div className="titulo-card">
          <span>CONVOCAÇÕES</span>
          <h2>Partidas</h2>
          <p>
            Selecione uma convocação para visualizar
            todos os detalhes.
          </p>
        </div>

        {lista.length === 0 ? (
          <div className="vazio">
            <strong>
              Nenhuma convocação disponível
            </strong>

            <span>
              Quando você for convocado para uma
              partida, ela aparecerá aqui.
            </span>
          </div>
        ) : (
          <div className="lista">
            {lista.map((item: any) => {
              const partida = item.partida;
              const convocacao = item.convocacao;

              return (
                <Link
                  key={item.id}
                  href={`/portal-atleta/convocacoes/${convocacao.id}`}
                  className="convocacao"
                >
                  <div className="data">
                    <strong>
                      {dia(partida.data_jogo)}
                    </strong>

                    <span>
                      {mes(partida.data_jogo)}
                    </span>
                  </div>

                  <div className="dados">
                    <span className="tipo">
                      {nomeTipo(partida.tipo)}
                    </span>

                    <h3>
                      A.D. Cannabrava
                      <b> x </b>
                      {partida.adversario}
                    </h3>

                    <p>
                      {partida.horario
                        ? partida.horario.slice(0, 5)
                        : "Horário a definir"}

                      {" • "}

                      {partida.local ||
                        "Local a definir"}
                    </p>
                  </div>

                  <div className="situacao">
                    <Resposta
                      resposta={item.resposta}
                    />

                    <small>
                      {convocacao.status === "aberta"
                        ? "Convocação aberta"
                        : nomeStatusConvocacao(
                            convocacao.status
                          )}
                    </small>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1350px;
          margin: 0 auto;
          padding: 22px 30px 40px;
        }

        .voltar {
          display: inline-flex;
          margin-bottom: 12px;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .rotulo {
          color: #168447;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .topo h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: 30px;
        }

        .topo p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .indicadores {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .indicador {
          padding: 14px 16px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .indicador span {
          display: block;
          color: #94a3b8;
          font-size: 8px;
          font-weight: 900;
        }

        .indicador strong {
          display: block;
          margin-top: 4px;
          color: #082e69;
          font-size: 22px;
        }

        .card {
          margin-top: 12px;
          padding: 18px;
          border: 1px solid #dce5f0;
          border-radius: 14px;
          background: #fff;
        }

        .titulo-card span {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
        }

        .titulo-card h2 {
          margin: 2px 0;
          color: #082e69;
          font-size: 18px;
        }

        .titulo-card p {
          margin: 0 0 15px;
          color: #94a3b8;
          font-size: 9px;
        }

        .lista {
          display: grid;
          gap: 8px;
        }

        .convocacao {
          display: grid;
          grid-template-columns: 58px 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          color: inherit;
          text-decoration: none;
          transition: .15s ease;
        }

        .convocacao:hover {
          border-color: #9dbbe4;
          background: #fafcff;
        }

        .data {
          width: 52px;
          height: 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #eef5ff;
        }

        .data strong {
          color: #082e69;
          font-size: 20px;
          line-height: 1;
        }

        .data span {
          margin-top: 3px;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .tipo {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .dados h3 {
          margin: 3px 0;
          color: #082e69;
          font-size: 14px;
        }

        .dados h3 b {
          color: #94a3b8;
          font-weight: 500;
        }

        .dados p {
          margin: 0;
          color: #64748b;
          font-size: 9px;
        }

        .situacao {
          text-align: right;
        }

        .situacao small {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 7px;
        }

        .resposta {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 7px;
          font-weight: 900;
        }

        .resposta.confirmado {
          background: #e7f7ee;
          color: #168447;
        }

        .resposta.pendente {
          background: #fff7e6;
          color: #b76e00;
        }

        .resposta.indisponivel {
          background: #fff0f0;
          color: #b42318;
        }

        .vazio {
          padding: 45px 20px;
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

        @media(max-width:700px) {
          .pagina {
            padding: 16px 14px 30px;
          }

          .indicadores {
            grid-template-columns: repeat(2, 1fr);
          }

          .convocacao {
            grid-template-columns: 52px 1fr;
          }

          .situacao {
            grid-column: 1 / -1;
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}

function Indicador({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div className="indicador">
      <span>{titulo.toUpperCase()}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function Resposta({
  resposta,
}: {
  resposta: string;
}) {
  const mapa: Record<string, string> = {
    confirmado: "Confirmado",
    pendente: "Aguardando resposta",
    indisponivel: "Indisponível",
  };

  return (
    <span className={`resposta ${resposta}`}>
      {mapa[resposta] || resposta}
    </span>
  );
}

function nomeStatusConvocacao(
  status: string
) {
  const mapa: Record<string, string> = {
    rascunho: "Rascunho",
    aberta: "Aberta",
    encerrada: "Encerrada",
    cancelada: "Cancelada",
  };

  return mapa[status] || status;
}

function nomeTipo(tipo: string) {
  const mapa: Record<string, string> = {
    oficial: "Jogo Oficial",
    amistoso: "Amistoso",
    jogo_treino: "Jogo-treino",
  };

  return mapa[tipo] || tipo;
}

function dia(data: string) {
  return data?.split("-")[2] || "--";
}

function mes(data: string) {
  if (!data) return "";

  const nomes = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];

  const indice =
    Number(data.split("-")[1]) - 1;

  return nomes[indice] || "";
}