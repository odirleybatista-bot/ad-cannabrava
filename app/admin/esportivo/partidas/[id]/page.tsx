import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  alterarStatusPartida,
  criarConvocacao,
  criarSumula,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PartidaDetalhePage({
  params,
}: Props) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const {
    data: partida,
    error,
  } =
    await supabase
      .from("partidas")
      .select(`
        *,
        competicoes (
          id,
          nome
        )
      `)
      .eq("id", id)
      .single();

  if (
    error ||
    !partida
  ) {
    notFound();
  }

  const {
    data: convocacao,
  } =
    await supabase
      .from("convocacoes")
      .select(`
        id,
        status,
        publicada_em,
        encerrada_em,
        limite_confirmacao
      `)
      .eq(
        "partida_id",
        id
      )
      .maybeSingle();

  const {
    data: sumula,
  } =
    await supabase
      .from("sumulas")
      .select(`
        id,
        status,
        gols_cannabrava,
        gols_adversario,
        finalizada_em
      `)
      .eq(
        "partida_id",
        id
      )
      .maybeSingle();

  let convocados = 0;
  let confirmados = 0;

  if (convocacao?.id) {
    const {
      data:
        atletasConvocados,
    } =
      await supabase
        .from(
          "convocacao_atletas"
        )
        .select(
          "id,resposta"
        )
        .eq(
          "convocacao_id",
          convocacao.id
        );

    convocados =
      atletasConvocados
        ?.length || 0;

    confirmados =
      atletasConvocados
        ?.filter(
          (item) =>
            item.resposta ===
            "confirmado"
        )
        .length || 0;
  }

  const {
    data: historico,
  } =
    await supabase
      .from(
        "partida_historico"
      )
      .select(`
        id,
        status_anterior,
        status_novo,
        motivo,
        alterado_em
      `)
      .eq(
        "partida_id",
        id
      )
      .order(
        "alterado_em",
        {
          ascending:
            false,
        }
      )
      .limit(10);

  return (
    <main className="pagina">
      <Link
        href="/admin/esportivo/partidas"
        className="voltar"
      >
        ← Voltar para partidas
      </Link>

      <section className="hero">
        <div>
          <span className="rotulo">
            GESTÃO ESPORTIVA • PARTIDA
          </span>

          <h1>
            A.D. Cannabrava
            <span> x </span>
            {partida.adversario}
          </h1>

          <p>
            {nomeTipo(
              partida.tipo
            )}
            {" • "}
            {formatarData(
              partida.data_jogo
            )}
            {partida.horario
              ? ` • ${formatarHorario(
                  partida.horario
                )}`
              : ""}
          </p>

          <div className="chips">
            <span>
              {partida.modalidade}
            </span>

            <span>
              {partida.mando ===
              "mandante"
                ? "Mandante"
                : partida.mando ===
                  "visitante"
                ? "Visitante"
                : "Campo neutro"}
            </span>

            {partida.temporada && (
              <span>
                Temporada{" "}
                {
                  partida.temporada
                }
              </span>
            )}
          </div>
        </div>

        <div className="status-box">
          <span>
            STATUS DA PARTIDA
          </span>

          <strong>
            {nomeStatus(
              partida.status
            )}
          </strong>

          {partida.status ===
            "finalizada" && (
            <div className="placar">
              {
                partida.gols_cannabrava ??
                0
              }
              <b>x</b>
              {
                partida.gols_adversario ??
                0
              }
            </div>
          )}
        </div>
      </section>

      <section className="indicadores">
        <Indicador
          titulo="Convocação"
          valor={
            convocacao
              ? nomeStatusConvocacao(
                  convocacao.status
                )
              : "Não criada"
          }
          ok={
            Boolean(
              convocacao
            )
          }
        />

        <Indicador
          titulo="Convocados"
          valor={String(
            convocados
          )}
          ok={
            convocados > 0
          }
        />

        <Indicador
          titulo="Confirmados"
          valor={String(
            confirmados
          )}
          ok={
            confirmados > 0
          }
        />

        <Indicador
          titulo="Súmula"
          valor={
            sumula
              ? nomeStatusSumula(
                  sumula.status
                )
              : "Não criada"
          }
          ok={
            sumula?.status ===
            "finalizada"
          }
        />
      </section>

      <div className="duas-colunas">
        <section className="card">
          <Titulo
            titulo="Informações da partida"
            descricao="Dados gerais do confronto."
          />

          <div className="info-grid">
            <Info
              label="Tipo"
              valor={nomeTipo(
                partida.tipo
              )}
            />

            <Info
              label="Competição"
              valor={
                partida.competicoes
                  ?.nome ||
                "Sem competição"
              }
            />

            <Info
              label="Temporada"
              valor={
                partida.temporada
              }
            />

            <Info
              label="Rodada"
              valor={
                partida.rodada
              }
            />

            <Info
              label="Fase"
              valor={
                partida.fase
              }
            />

            <Info
              label="Grupo"
              valor={
                partida.grupo
              }
            />

            <Info
              label="Data"
              valor={formatarData(
                partida.data_jogo
              )}
            />

            <Info
              label="Horário"
              valor={
                partida.horario
                  ? formatarHorario(
                      partida.horario
                    )
                  : null
              }
            />

            <Info
              label="Local"
              valor={
                partida.local
              }
            />

            <Info
              label="Cidade"
              valor={
                partida.cidade
              }
            />
          </div>
        </section>

        <section className="card">
          <Titulo
            titulo="Situação da partida"
            descricao="Controle administrativo do jogo."
          />

          <form
            action={alterarStatusPartida.bind(
              null,
              id
            )}
            className="status-form"
          >
            <label htmlFor="status">
              Alterar status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={
                partida.status
              }
            >
              <option value="agendada">
                Agendada
              </option>

              <option value="confirmada">
                Confirmada
              </option>

              <option value="em_andamento">
                Em andamento
              </option>

              <option value="finalizada">
                Finalizada
              </option>

              <option value="adiada">
                Adiada
              </option>

              <option value="cancelada">
                Cancelada
              </option>
            </select>

            <button type="submit">
              Atualizar status
            </button>
          </form>
        </section>
      </div>

      <section className="fluxo">
        <div className="fluxo-topo">
          <div>
            <span>
              FLUXO DA PARTIDA
            </span>

            <h2>
              Operações esportivas
            </h2>

            <p>
              Avance da convocação
              até a súmula final.
            </p>
          </div>
        </div>

        <div className="fluxo-grid">
          <article
            className={
              convocacao
                ? "etapa ok"
                : "etapa"
            }
          >
            <div className="numero">
              1
            </div>

            <div>
              <span>
                CONVOCAÇÃO
              </span>

              <h3>
                {convocacao
                  ? nomeStatusConvocacao(
                      convocacao.status
                    )
                  : "Criar convocação"}
              </h3>

              <p>
                Selecione os atletas
                convocados para a
                partida.
              </p>

              {convocacao ? (
                <Link
                  href={`/admin/esportivo/partidas/${id}/convocacao`}
                >
                  Abrir convocação
                </Link>
              ) : (
                <form
                  action={criarConvocacao.bind(
                    null,
                    id
                  )}
                >
                  <button type="submit">
                    Criar convocação
                  </button>
                </form>
              )}
            </div>
          </article>

          <article
            className={
              sumula
                ? "etapa ok"
                : "etapa"
            }
          >
            <div className="numero">
              2
            </div>

            <div>
              <span>
                SÚMULA
              </span>

              <h3>
                {sumula
                  ? nomeStatusSumula(
                      sumula.status
                    )
                  : "Criar súmula"}
              </h3>

              <p>
                Escalação, gols,
                cartões e eventos
                do jogo.
              </p>

              {sumula ? (
                <Link
                  href={`/admin/esportivo/partidas/${id}/sumula`}
                >
                  Abrir súmula
                </Link>
              ) : (
                <form
                  action={criarSumula.bind(
                    null,
                    id
                  )}
                >
                  <button type="submit">
                    Criar súmula
                  </button>
                </form>
              )}
            </div>
          </article>

          <article
            className={
              sumula?.status ===
              "finalizada"
                ? "etapa ok"
                : "etapa"
            }
          >
            <div className="numero">
              3
            </div>

            <div>
              <span>
                ESTATÍSTICAS
              </span>

              <h3>
                {sumula?.status ===
                "finalizada"
                  ? "Atualizadas"
                  : "Aguardando súmula"}
              </h3>

              <p>
                As estatísticas serão
                consolidadas após a
                finalização da súmula.
              </p>
            </div>
          </article>
        </div>
      </section>

      {partida.observacoes && (
        <section className="card">
          <Titulo
            titulo="Observações"
            descricao="Informações adicionais da partida."
          />

          <p className="observacoes">
            {partida.observacoes}
          </p>
        </section>
      )}

      <section className="card">
        <Titulo
          titulo="Histórico"
          descricao="Alterações recentes de status da partida."
        />

        {!historico ||
        historico.length ===
          0 ? (
          <div className="vazio">
            Nenhuma alteração
            registrada.
          </div>
        ) : (
          <div className="historico">
            {historico.map(
              (item: any) => (
                <div
                  key={item.id}
                  className="historico-item"
                >
                  <div>
                    <strong>
                      {nomeStatus(
                        item.status_novo
                      )}
                    </strong>

                    <span>
                      {item.status_anterior
                        ? `${nomeStatus(
                            item.status_anterior
                          )} → `
                        : ""}
                      {nomeStatus(
                        item.status_novo
                      )}
                    </span>
                  </div>

                  <small>
                    {formatarDataHora(
                      item.alterado_em
                    )}
                  </small>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 22px 24px 40px;
        }

        .voltar {
          display: inline-flex;
          margin-bottom: 11px;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
          padding: 22px;
          border: 1px solid #dce5f0;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #fff,
              #f4f8fd
            );
        }

        .rotulo {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .hero h1 {
          margin: 5px 0;
          color: #082e69;
          font-size: clamp(
            24px,
            3vw,
            34px
          );
        }

        .hero h1 span {
          color: #94a3b8;
          font-weight: 500;
        }

        .hero p {
          margin: 0 0 10px;
          color: #64748b;
          font-size: 11px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .chips span {
          padding: 5px 8px;
          border-radius: 999px;
          background: #eef5ff;
          color: #36516f;
          font-size: 7px;
          font-weight: 900;
        }

        .status-box {
          min-width: 190px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #082e69;
          color: white;
        }

        .status-box > span {
          display: block;
          font-size: 6px;
          font-weight: 900;
          opacity: .6;
        }

        .status-box > strong {
          display: block;
          margin-top: 3px;
          font-size: 18px;
        }

        .placar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          font-size: 27px;
          font-weight: 900;
        }

        .placar b {
          font-size: 13px;
          opacity: .55;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .indicador {
          padding: 12px 14px;
          border: 1px solid #dce5f0;
          border-radius: 10px;
          background: white;
        }

        .indicador.ok {
          border-left:
            3px solid #168447;
        }

        .indicador span {
          display: block;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
        }

        .indicador strong {
          display: block;
          margin-top: 4px;
          color: #082e69;
          font-size: 13px;
        }

        .duas-colunas {
          display: grid;
          grid-template-columns:
            1.5fr .5fr;
          gap: 10px;
          margin-top: 10px;
        }

        .card,
        .fluxo {
          margin-top: 10px;
          padding: 17px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: #fff;
        }

        .duas-colunas .card {
          margin-top: 0;
        }

        .titulo {
          margin-bottom: 14px;
        }

        .titulo span,
        .fluxo-topo span,
        .etapa span {
          color: #168447;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .titulo h2,
        .fluxo-topo h2 {
          margin: 2px 0;
          color: #082e69;
          font-size: 16px;
        }

        .titulo p,
        .fluxo-topo p {
          margin: 0;
          color: #94a3b8;
          font-size: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns:
            repeat(5,1fr);
          gap: 14px;
        }

        .info span {
          display: block;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
        }

        .info strong {
          display: block;
          margin-top: 3px;
          color: #334155;
          font-size: 9px;
        }

        .status-form {
          display: grid;
          gap: 8px;
        }

        .status-form label {
          color: #475569;
          font-size: 8px;
          font-weight: 900;
        }

        .status-form select {
          height: 41px;
          padding: 0 9px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: white;
        }

        .status-form button,
        .etapa button,
        .etapa a {
          min-height: 37px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          border: 0;
          border-radius: 7px;
          background: #082e69;
          color: white;
          font-size: 8px;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
        }

        .fluxo-grid {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 9px;
          margin-top: 14px;
        }

        .etapa {
          display: flex;
          gap: 11px;
          padding: 14px;
          border: 1px solid #e3e9f0;
          border-radius: 10px;
          background: #fbfcfd;
        }

        .etapa.ok {
          border-color: #cce7d7;
          background: #f5fbf7;
        }

        .numero {
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eaf2ff;
          color: #1763d6;
          font-size: 11px;
          font-weight: 900;
        }

        .etapa.ok .numero {
          background: #e7f7ee;
          color: #168447;
        }

        .etapa h3 {
          margin: 3px 0;
          color: #082e69;
          font-size: 12px;
        }

        .etapa p {
          min-height: 30px;
          margin: 0 0 10px;
          color: #64748b;
          font-size: 8px;
          line-height: 1.5;
        }

        .observacoes {
          margin: 0;
          color: #475569;
          font-size: 10px;
          line-height: 1.7;
        }

        .historico {
          display: grid;
          gap: 7px;
        }

        .historico-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 9px 11px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .historico-item strong {
          display: block;
          color: #334155;
          font-size: 9px;
        }

        .historico-item span,
        .historico-item small {
          color: #94a3b8;
          font-size: 7px;
        }

        .vazio {
          padding: 20px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 9px;
          text-align: center;
        }

        @media(max-width:1000px) {
          .duas-colunas {
            grid-template-columns:1fr;
          }

          .info-grid {
            grid-template-columns:
              repeat(2,1fr);
          }

          .fluxo-grid {
            grid-template-columns:1fr;
          }
        }

        @media(max-width:750px) {
          .pagina {
            padding:14px 10px 30px;
          }

          .hero {
            align-items:flex-start;
            flex-direction:column;
          }

          .status-box {
            width:100%;
          }

          .indicadores {
            grid-template-columns:
              repeat(2,1fr);
          }
        }
      `}</style>
    </main>
  );
}

function Titulo({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="titulo">
      <span>
        PARTIDA
      </span>

      <h2>{titulo}</h2>

      <p>{descricao}</p>
    </div>
  );
}

function Info({
  label,
  valor,
}: {
  label: string;
  valor?: string | null;
}) {
  return (
    <div className="info">
      <span>
        {label.toUpperCase()}
      </span>

      <strong>
        {valor || "Não informado"}
      </strong>
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  ok,
}: {
  titulo: string;
  valor: string;
  ok: boolean;
}) {
  return (
    <div
      className={
        ok
          ? "indicador ok"
          : "indicador"
      }
    >
      <span>
        {titulo.toUpperCase()}
      </span>

      <strong>{valor}</strong>
    </div>
  );
}

function nomeTipo(
  tipo: string
) {
  const mapa: Record<
    string,
    string
  > = {
    oficial:
      "Jogo Oficial",

    amistoso:
      "Amistoso",

    jogo_treino:
      "Jogo-treino",
  };

  return mapa[tipo] || tipo;
}

function nomeStatus(
  status: string
) {
  const mapa: Record<
    string,
    string
  > = {
    agendada: "Agendada",
    confirmada: "Confirmada",
    em_andamento:
      "Em andamento",
    finalizada: "Finalizada",
    adiada: "Adiada",
    cancelada: "Cancelada",
  };

  return mapa[status] || status;
}

function nomeStatusConvocacao(
  status: string
) {
  const mapa: Record<
    string,
    string
  > = {
    rascunho: "Rascunho",
    aberta: "Aberta",
    encerrada: "Encerrada",
    cancelada: "Cancelada",
  };

  return mapa[status] || status;
}

function nomeStatusSumula(
  status: string
) {
  const mapa: Record<
    string,
    string
  > = {
    rascunho: "Rascunho",
    em_preenchimento:
      "Em preenchimento",
    finalizada: "Finalizada",
    reaberta: "Reaberta",
  };

  return mapa[status] || status;
}

function formatarData(
  data: string | null
) {
  if (!data) {
    return "—";
  }

  const [
    ano,
    mes,
    dia,
  ] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(
  horario: string
) {
  return horario.slice(
    0,
    5
  );
}

function formatarDataHora(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(
    new Date(data)
  );
}