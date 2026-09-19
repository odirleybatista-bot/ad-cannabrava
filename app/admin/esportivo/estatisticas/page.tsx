import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function EstatisticasPage() {
  const supabase =
    await createClient();

  const {
    data: atletas,
    error: erroAtletas,
  } =
    await supabase
      .from(
        "estatisticas_atletas_partidas"
      )
      .select("*")
      .order(
        "gols",
        {
          ascending: false,
        }
      )
      .order(
        "assistencias",
        {
          ascending: false,
        }
      )
      .order(
        "nome",
        {
          ascending: true,
        }
      );

  if (erroAtletas) {
    console.error(
      "Erro ao carregar estatísticas dos atletas:",
      erroAtletas
    );
  }

  const {
    data: temporadas,
    error: erroTemporada,
  } =
    await supabase
      .from("resumo_temporada")
      .select("*")
      .order(
        "modalidade",
        {
          ascending: true,
        }
      );

  if (erroTemporada) {
    console.error(
      "Erro ao carregar resumo da temporada:",
      erroTemporada
    );
  }

  const lista =
    atletas || [];

  const resumo =
    temporadas || [];

  const totalJogos =
    resumo.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item.jogos || 0
        ),
      0
    );

  const totalVitorias =
    resumo.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item.vitorias || 0
        ),
      0
    );

  const totalEmpates =
    resumo.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item.empates || 0
        ),
      0
    );

  const totalDerrotas =
    resumo.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item.derrotas || 0
        ),
      0
    );

  const totalGolsPro =
    resumo.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item.gols_pro || 0
        ),
      0
    );

  const totalGolsContra =
    resumo.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item.gols_contra || 0
        ),
      0
    );

  const saldo =
    totalGolsPro -
    totalGolsContra;

  const artilheiro =
    lista.find(
      (item: any) =>
        Number(
          item.gols || 0
        ) > 0
    );

  const liderAssistencias =
    [...lista]
      .sort(
        (
          a: any,
          b: any
        ) =>
          Number(
            b.assistencias ||
              0
          ) -
          Number(
            a.assistencias ||
              0
          )
      )
      .find(
        (item: any) =>
          Number(
            item.assistencias ||
              0
          ) > 0
      );

  return (
    <main className="pagina">
      <header className="topo">
        <div>
          <span className="rotulo">
            GESTÃO ESPORTIVA
          </span>

          <h1>
            Estatísticas
          </h1>

          <p>
            Desempenho coletivo e
            individual da A.D.
            Cannabrava.
          </p>
        </div>

        <Link
          href="/admin/esportivo"
          className="voltar"
        >
          ← Gestão Esportiva
        </Link>
      </header>

      <section className="resumo-principal">
        <CardResumo
          titulo="Jogos"
          valor={totalJogos}
        />

        <CardResumo
          titulo="Vitórias"
          valor={totalVitorias}
        />

        <CardResumo
          titulo="Empates"
          valor={totalEmpates}
        />

        <CardResumo
          titulo="Derrotas"
          valor={totalDerrotas}
        />

        <CardResumo
          titulo="Gols pró"
          valor={totalGolsPro}
        />

        <CardResumo
          titulo="Gols contra"
          valor={totalGolsContra}
        />

        <CardResumo
          titulo="Saldo"
          valor={
            saldo > 0
              ? `+${saldo}`
              : saldo
          }
        />
      </section>

      <section className="destaques">
        <div className="destaque">
          <span>
            ARTILHEIRO
          </span>

          <strong>
            {artilheiro
              ? artilheiro.apelido ||
                artilheiro.nome
              : "—"}
          </strong>

          <small>
            {artilheiro
              ? `${artilheiro.gols} gol${
                  Number(
                    artilheiro.gols
                  ) === 1
                    ? ""
                    : "s"
                }`
              : "Nenhum gol registrado"}
          </small>
        </div>

        <div className="destaque">
          <span>
            ASSISTÊNCIAS
          </span>

          <strong>
            {liderAssistencias
              ? liderAssistencias.apelido ||
                liderAssistencias.nome
              : "—"}
          </strong>

          <small>
            {liderAssistencias
              ? `${liderAssistencias.assistencias} assistência${
                  Number(
                    liderAssistencias.assistencias
                  ) === 1
                    ? ""
                    : "s"
                }`
              : "Nenhuma assistência registrada"}
          </small>
        </div>

        <div className="destaque">
          <span>
            ELENCO
          </span>

          <strong>
            {
              lista.filter(
                (item: any) =>
                  Number(
                    item.jogos_relacionado ||
                      0
                  ) > 0
              ).length
            }
          </strong>

          <small>
            atletas com participação
            em súmula
          </small>
        </div>
      </section>

      {resumo.length > 0 && (
        <section className="card">
          <div className="titulo-card">
            <span>
              TEMPORADA
            </span>

            <h2>
              Desempenho por modalidade
            </h2>

            <p>
              Resumo das partidas
              finalizadas.
            </p>
          </div>

          <div className="modalidades">
            {resumo.map(
              (item: any) => (
                <div
                  key={
                    item.modalidade
                  }
                  className="modalidade"
                >
                  <div className="modalidade-topo">
                    <strong>
                      {item.modalidade ||
                        "Não informada"}
                    </strong>

                    <span>
                      {item.jogos} jogo
                      {Number(
                        item.jogos
                      ) === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  <div className="modalidade-grid">
                    <Mini
                      titulo="V"
                      valor={
                        item.vitorias
                      }
                    />

                    <Mini
                      titulo="E"
                      valor={
                        item.empates
                      }
                    />

                    <Mini
                      titulo="D"
                      valor={
                        item.derrotas
                      }
                    />

                    <Mini
                      titulo="GP"
                      valor={
                        item.gols_pro
                      }
                    />

                    <Mini
                      titulo="GC"
                      valor={
                        item.gols_contra
                      }
                    />

                    <Mini
                      titulo="SG"
                      valor={
                        Number(
                          item.saldo_gols
                        ) > 0
                          ? `+${item.saldo_gols}`
                          : item.saldo_gols
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}

      <section className="card">
        <div className="titulo-card">
          <span>
            ATLETAS
          </span>

          <h2>
            Estatísticas individuais
          </h2>

          <p>
            Dados consolidados das
            súmulas finalizadas.
          </p>
        </div>

        {lista.length === 0 ? (
          <div className="vazio">
            Nenhuma estatística
            disponível.
          </div>
        ) : (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Atleta</th>
                  <th>Posição</th>
                  <th>Rel.</th>
                  <th>Jogos</th>
                  <th>Tit.</th>
                  <th>Gols</th>
                  <th>Ast.</th>
                  <th>CA</th>
                  <th>CV</th>
                  <th>Pên. perd.</th>
                  <th>Min.</th>
                </tr>
              </thead>

              <tbody>
                {lista.map(
                  (
                    atleta: any,
                    indice: number
                  ) => (
                    <tr
                      key={
                        atleta.atleta_id
                      }
                    >
                      <td>
                        <div className="atleta">
                          <div className="ranking">
                            {
                              indice +
                              1
                            }
                          </div>

                          <div>
                            <strong>
                              {atleta.apelido ||
                                atleta.nome}
                            </strong>

                            {atleta.apelido && (
                              <small>
                                {
                                  atleta.nome
                                }
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        {atleta.posicao ||
                          "—"}
                      </td>

                      <td>
                        {
                          atleta.jogos_relacionado
                        }
                      </td>

                      <td>
                        {
                          atleta.jogos_jogados
                        }
                      </td>

                      <td>
                        {
                          atleta.jogos_titular
                        }
                      </td>

                      <td className="numero destaque-numero">
                        {atleta.gols}
                      </td>

                      <td className="numero">
                        {
                          atleta.assistencias
                        }
                      </td>

                      <td className="numero amarelo">
                        {
                          atleta.cartoes_amarelos
                        }
                      </td>

                      <td className="numero vermelho">
                        {
                          atleta.cartoes_vermelhos
                        }
                      </td>

                      <td className="numero">
                        {
                          atleta.penaltis_perdidos
                        }
                      </td>

                      <td className="numero">
                        {
                          atleta.minutos_jogados
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1550px;
          margin: 0 auto;
          padding: 22px 24px 40px;
        }

        .topo {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 16px;
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
          font-size: 11px;
        }

        .voltar {
          padding: 9px 12px;
          border: 1px solid #dce5f0;
          border-radius: 8px;
          color: #082e69;
          background: white;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .resumo-principal {
          display: grid;
          grid-template-columns:
            repeat(7,1fr);
          gap: 8px;
        }

        .resumo {
          padding: 13px;
          border: 1px solid #dce5f0;
          border-radius: 11px;
          background: white;
        }

        .resumo span {
          display: block;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
        }

        .resumo strong {
          display: block;
          margin-top: 4px;
          color: #082e69;
          font-size: 21px;
        }

        .destaques {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 9px;
          margin-top: 9px;
        }

        .destaque {
          padding: 15px;
          border: 1px solid #dce5f0;
          border-left:
            4px solid #168447;
          border-radius: 11px;
          background: white;
        }

        .destaque span {
          display: block;
          color: #168447;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .destaque strong {
          display: block;
          margin-top: 4px;
          color: #082e69;
          font-size: 17px;
        }

        .destaque small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 8px;
        }

        .card {
          margin-top: 10px;
          padding: 17px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: white;
        }

        .titulo-card {
          margin-bottom: 14px;
        }

        .titulo-card span {
          color: #168447;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .titulo-card h2 {
          margin: 2px 0;
          color: #082e69;
          font-size: 16px;
        }

        .titulo-card p {
          margin: 0;
          color: #94a3b8;
          font-size: 8px;
        }

        .modalidades {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 9px;
        }

        .modalidade {
          padding: 13px;
          border: 1px solid #e3e9f0;
          border-radius: 10px;
          background: #fbfcfd;
        }

        .modalidade-topo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .modalidade-topo strong {
          color: #082e69;
          font-size: 11px;
        }

        .modalidade-topo span {
          color: #94a3b8;
          font-size: 7px;
        }

        .modalidade-grid {
          display: grid;
          grid-template-columns:
            repeat(6,1fr);
          gap: 5px;
        }

        .mini {
          padding: 7px 5px;
          border-radius: 7px;
          background: white;
          text-align: center;
        }

        .mini span {
          display: block;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
        }

        .mini strong {
          display: block;
          margin-top: 2px;
          color: #082e69;
          font-size: 11px;
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
          border-bottom:
            2px solid #e2e8f0;
          color: #64748b;
          font-size: 6px;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        td {
          padding: 9px 8px;
          border-bottom:
            1px solid #edf1f5;
          color: #475569;
          font-size: 8px;
        }

        .atleta {
          min-width: 190px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ranking {
          flex: 0 0 27px;
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .atleta strong {
          display: block;
          color: #082e69;
          font-size: 9px;
        }

        .atleta small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 6px;
        }

        .numero {
          font-weight: 800;
        }

        .destaque-numero {
          color: #168447;
          font-size: 10px;
        }

        .amarelo {
          color: #a87900;
        }

        .vermelho {
          color: #b42318;
        }

        .vazio {
          padding: 35px;
          border: 1px dashed #cbd5e1;
          border-radius: 9px;
          color: #94a3b8;
          font-size: 9px;
          text-align: center;
        }

        @media(max-width:1150px) {
          .resumo-principal {
            grid-template-columns:
              repeat(4,1fr);
          }

          .modalidades {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media(max-width:750px) {
          .pagina {
            padding: 14px 10px 30px;
          }

          .topo {
            align-items: stretch;
            flex-direction: column;
          }

          .resumo-principal {
            grid-template-columns:
              repeat(2,1fr);
          }

          .destaques,
          .modalidades {
            grid-template-columns:1fr;
          }
        }
      `}</style>
    </main>
  );
}

function CardResumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor:
    | string
    | number;
}) {
  return (
    <div className="resumo">
      <span>
        {titulo.toUpperCase()}
      </span>

      <strong>{valor}</strong>
    </div>
  );
}

function Mini({
  titulo,
  valor,
}: {
  titulo: string;
  valor:
    | string
    | number;
}) {
  return (
    <div className="mini">
      <span>{titulo}</span>
      <strong>
        {valor ?? 0}
      </strong>
    </div>
  );
}