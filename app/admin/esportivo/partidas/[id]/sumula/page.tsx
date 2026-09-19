import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  salvarEscalacao,
  salvarDadosSumula,
  finalizarSumulaAction,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SumulaPage({
  params,
}: Props) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const {
    data: partida,
  } =
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
        status,
        gols_cannabrava,
        gols_adversario
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle();

  if (!partida) {
    notFound();
  }

  let {
    data: sumula,
  } =
    await supabase
      .from("sumulas")
      .select(`
        id,
        status,
        gols_cannabrava,
        gols_adversario,
        acrescimo_primeiro_tempo,
        acrescimo_segundo_tempo,
        publico,
        renda,
        observacoes,
        finalizada_em
      `)
      .eq(
        "partida_id",
        id
      )
      .maybeSingle();

  if (!sumula) {
    const {
      data: usuarioId,
    } =
      await supabase.rpc(
        "usuario_id_atual"
      );

    const {
      data: criada,
      error,
    } =
      await supabase
        .from("sumulas")
        .insert({
          partida_id: id,
          status: "rascunho",
          gols_cannabrava: 0,
          gols_adversario: 0,
          criado_por:
            usuarioId || null,
        })
        .select(`
          id,
          status,
          gols_cannabrava,
          gols_adversario,
          acrescimo_primeiro_tempo,
          acrescimo_segundo_tempo,
          publico,
          renda,
          observacoes,
          finalizada_em
        `)
        .single();

    if (
      error ||
      !criada
    ) {
      throw new Error(
        error?.message ||
          "Não foi possível criar a súmula."
      );
    }

    sumula = criada;
  }

  const {
    data: convocacao,
  } =
    await supabase
      .from("convocacoes")
      .select("id,status")
      .eq(
        "partida_id",
        id
      )
      .maybeSingle();

  let convocadosConfirmados:
    any[] = [];

  if (convocacao?.id) {
    const {
      data: confirmados,
    } =
      await supabase
        .from(
          "convocacao_atletas"
        )
        .select(`
          atleta_id,
          resposta
        `)
        .eq(
          "convocacao_id",
          convocacao.id
        )
        .eq(
          "resposta",
          "confirmado"
        );

    const ids =
      (confirmados || [])
        .map(
          (item: any) =>
            item.atleta_id
        )
        .filter(Boolean);

    if (ids.length > 0) {
      const {
        data: atletas,
      } =
        await supabase
          .from("atletas")
          .select(`
            id,
            nome,
            apelido,
            posicao,
            numero_camisa,
            modalidade,
            status
          `)
          .in(
            "id",
            ids
          )
          .order(
            "nome",
            {
              ascending:
                true,
            }
          );

      convocadosConfirmados =
        atletas || [];
    }
  }

  const {
    data: escalacao,
  } =
    await supabase
      .from("sumula_atletas")
      .select(`
        id,
        atleta_id,
        numero_camisa,
        posicao,
        situacao,
        capitao,
        goleiro,
        minutos_jogados
      `)
      .eq(
        "sumula_id",
        sumula.id
      );

  const {
    data: eventos,
  } =
    await supabase
      .from("sumula_eventos")
      .select(`
        id,
        tipo,
        equipe
      `)
      .eq(
        "sumula_id",
        sumula.id
      );

  const finalizada =
    sumula.status ===
    "finalizada";

  const titulares =
    (escalacao || [])
      .filter(
        (item: any) =>
          item.situacao ===
          "titular"
      ).length;

  const reservas =
    (escalacao || [])
      .filter(
        (item: any) =>
          item.situacao ===
          "reserva"
      ).length;

  const golsEventos =
    (eventos || [])
      .filter(
        (item: any) =>
          item.equipe ===
            "cannabrava" &&
          (
            item.tipo === "gol" ||
            item.tipo ===
              "penalti_convertido"
          )
      ).length;

  const salvarEscalacaoAction =
    salvarEscalacao.bind(
      null,
      id,
      sumula.id
    );

  const salvarDadosAction =
    salvarDadosSumula.bind(
      null,
      id,
      sumula.id
    );

  const finalizarAction =
    finalizarSumulaAction.bind(
      null,
      id,
      sumula.id
    );

  return (
    <main className="pagina">
      <Link
        href={`/admin/esportivo/partidas/${id}`}
        className="voltar"
      >
        ← Voltar para a partida
      </Link>

      <section className="hero">
        <div>
          <span className="rotulo">
            GESTÃO ESPORTIVA • SÚMULA
          </span>

          <h1>
            A.D. Cannabrava
            <b> x </b>
            {partida.adversario}
          </h1>

          <p>
            {formatarData(
              partida.data_jogo
            )}

            {partida.horario
              ? ` • ${partida.horario.slice(
                  0,
                  5
                )}`
              : ""}

            {partida.local
              ? ` • ${partida.local}`
              : ""}
          </p>
        </div>

        <div className="placar-hero">
          <span>
            {nomeStatus(
              sumula.status
            )}
          </span>

          <div>
            <strong>
              {
                sumula.gols_cannabrava
              }
            </strong>

            <b>x</b>

            <strong>
              {
                sumula.gols_adversario
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="indicadores">
        <Indicador
          titulo="Confirmados"
          valor={
            convocadosConfirmados.length
          }
        />

        <Indicador
          titulo="Titulares"
          valor={titulares}
        />

        <Indicador
          titulo="Reservas"
          valor={reservas}
        />

        <Indicador
          titulo="Eventos"
          valor={
            eventos?.length || 0
          }
        />
      </section>

      {!convocacao && (
        <div className="aviso">
          Esta partida ainda não possui
          convocação. Crie e publique uma
          convocação antes de montar a
          escalação.
        </div>
      )}

      {convocacao &&
        convocadosConfirmados.length ===
          0 && (
          <div className="aviso">
            Ainda não existem atletas com
            presença confirmada nesta
            convocação.
          </div>
        )}

      <form
        action={
          salvarEscalacaoAction
        }
      >
        <section className="card">
          <div className="titulo">
            <div>
              <span>
                ESCALAÇÃO
              </span>

              <h2>
                Atletas disponíveis
              </h2>

              <p>
                Defina titulares,
                reservas, camisa e
                função na partida.
              </p>
            </div>

            {!finalizada &&
              convocadosConfirmados.length >
                0 && (
                <button
                  type="submit"
                  className="botao salvar"
                >
                  Salvar escalação
                </button>
              )}
          </div>

          {convocadosConfirmados.length ===
          0 ? (
            <div className="vazio">
              Nenhum atleta confirmado
              disponível para escalação.
            </div>
          ) : (
            <div className="tabela-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Atleta</th>
                    <th>Posição</th>
                    <th>Camisa</th>
                    <th>Situação</th>
                    <th>Capitão</th>
                    <th>Goleiro</th>
                  </tr>
                </thead>

                <tbody>
                  {convocadosConfirmados.map(
                    (
                      atleta: any
                    ) => {
                      const atual =
                        (
                          escalacao ||
                          []
                        ).find(
                          (
                            item:
                              any
                          ) =>
                            item.atleta_id ===
                            atleta.id
                        );

                      return (
                        <tr
                          key={
                            atleta.id
                          }
                        >
                          <td>
                            <input
                              type="hidden"
                              name="atleta_id"
                              value={
                                atleta.id
                              }
                            />

                            <div className="atleta">
                              <div className="avatar">
                                {iniciais(
                                  atleta.apelido ||
                                    atleta.nome
                                )}
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
                            <input
                              className="input"
                              name={`posicao_${atleta.id}`}
                              defaultValue={
                                atual?.posicao ||
                                atleta.posicao ||
                                ""
                              }
                              disabled={
                                finalizada
                              }
                            />
                          </td>

                          <td>
                            <input
                              className="input numero"
                              type="number"
                              min="0"
                              name={`numero_${atleta.id}`}
                              defaultValue={
                                atual?.numero_camisa ??
                                atleta.numero_camisa ??
                                ""
                              }
                              disabled={
                                finalizada
                              }
                            />
                          </td>

                          <td>
                            <select
                              className="input"
                              name={`situacao_${atleta.id}`}
                              defaultValue={
                                atual?.situacao ||
                                "reserva"
                              }
                              disabled={
                                finalizada
                              }
                            >
                              <option value="titular">
                                Titular
                              </option>

                              <option value="reserva">
                                Reserva
                              </option>

                              <option value="nao_utilizado">
                                Não utilizado
                              </option>
                            </select>
                          </td>

                          <td className="centro">
                            <input
                              type="checkbox"
                              name={`capitao_${atleta.id}`}
                              defaultChecked={
                                Boolean(
                                  atual?.capitao
                                )
                              }
                              disabled={
                                finalizada
                              }
                            />
                          </td>

                          <td className="centro">
                            <input
                              type="checkbox"
                              name={`goleiro_${atleta.id}`}
                              defaultChecked={
                                Boolean(
                                  atual?.goleiro
                                )
                              }
                              disabled={
                                finalizada
                              }
                            />
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </form>

      <form
        action={
          salvarDadosAction
        }
      >
        <section className="card">
          <div className="titulo">
            <div>
              <span>
                RESULTADO
              </span>

              <h2>
                Dados da partida
              </h2>

              <p>
                Registre o placar e as
                informações gerais da
                súmula.
              </p>
            </div>

            {!finalizada && (
              <button
                type="submit"
                className="botao salvar"
              >
                Salvar súmula
              </button>
            )}
          </div>

          <div className="placar-form">
            <div>
              <span>
                A.D. CANNABRAVA
              </span>

              <input
                type="number"
                min="0"
                name="gols_cannabrava"
                defaultValue={
                  sumula.gols_cannabrava
                }
                disabled={
                  finalizada
                }
              />
            </div>

            <b>x</b>

            <div>
              <span>
                {
                  partida.adversario
                }
              </span>

              <input
                type="number"
                min="0"
                name="gols_adversario"
                defaultValue={
                  sumula.gols_adversario
                }
                disabled={
                  finalizada
                }
              />
            </div>
          </div>

          <div className="grid-dados">
            <Campo
              label="Acréscimo 1º tempo"
              name="acrescimo_primeiro_tempo"
              type="number"
              defaultValue={
                sumula.acrescimo_primeiro_tempo
              }
              disabled={
                finalizada
              }
            />

            <Campo
              label="Acréscimo 2º tempo"
              name="acrescimo_segundo_tempo"
              type="number"
              defaultValue={
                sumula.acrescimo_segundo_tempo
              }
              disabled={
                finalizada
              }
            />

            <Campo
              label="Público"
              name="publico"
              type="number"
              defaultValue={
                sumula.publico
              }
              disabled={
                finalizada
              }
            />

            <Campo
              label="Renda"
              name="renda"
              defaultValue={
                sumula.renda
              }
              disabled={
                finalizada
              }
            />
          </div>

          <div className="campo-texto">
            <label htmlFor="observacoes">
              Observações da súmula
            </label>

            <textarea
              id="observacoes"
              name="observacoes"
              rows={4}
              defaultValue={
                sumula.observacoes ||
                ""
              }
              disabled={
                finalizada
              }
            />
          </div>
        </section>
      </form>

      <section className="card">
        <div className="titulo">
          <div>
            <span>
              EVENTOS
            </span>

            <h2>
              Ocorrências da partida
            </h2>

            <p>
              Gols, assistências,
              cartões e substituições.
            </p>
          </div>

          {!finalizada && (
            <Link
              href={`/admin/esportivo/partidas/${id}/sumula/eventos`}
              className="botao eventos"
            >
              Registrar eventos
            </Link>
          )}
        </div>

        <div className="resumo-eventos">
          <div>
            <span>
              Eventos registrados
            </span>

            <strong>
              {
                eventos?.length ||
                0
              }
            </strong>
          </div>

          <div>
            <span>
              Gols Cannabrava
            </span>

            <strong>
              {golsEventos}
            </strong>
          </div>
        </div>
      </section>

      <section className="card finalizacao">
        {finalizada ? (
          <div className="finalizada">
            <div>
              <span>
                SÚMULA FINALIZADA
              </span>

              <h2>
                Partida encerrada
              </h2>

              <p>
                O resultado já foi
                transferido para a
                partida e as estatísticas
                podem ser consolidadas.
              </p>
            </div>

            <strong className="placar-final">
              {
                sumula.gols_cannabrava
              }
              <b>x</b>
              {
                sumula.gols_adversario
              }
            </strong>
          </div>
        ) : (
          <div className="finalizar">
            <div>
              <span>
                FINALIZAÇÃO
              </span>

              <h2>
                Encerrar súmula
              </h2>

              <p>
                Após finalizar, o placar
                será gravado na partida.
                Para alterações futuras,
                será necessário reabrir
                a súmula.
              </p>
            </div>

            <form
              action={
                finalizarAction
              }
            >
              <button
                type="submit"
                className="botao finalizar-botao"
              >
                Finalizar súmula
              </button>
            </form>
          </div>
        )}
      </section>

      <style>{`
        .pagina {
          width:100%;
          max-width:1500px;
          margin:0 auto;
          padding:22px 24px 40px;
        }

        .voltar {
          display:inline-flex;
          margin-bottom:11px;
          color:#1763d6;
          font-size:10px;
          font-weight:900;
          text-decoration:none;
        }

        .hero {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
          padding:21px;
          border:1px solid #dce5f0;
          border-radius:15px;
          background:
            linear-gradient(
              135deg,
              #fff,
              #f4f8fd
            );
        }

        .rotulo {
          color:#168447;
          font-size:7px;
          font-weight:900;
          letter-spacing:.08em;
        }

        .hero h1 {
          margin:4px 0;
          color:#082e69;
          font-size:28px;
        }

        .hero h1 b {
          color:#94a3b8;
          font-weight:500;
        }

        .hero p {
          margin:0;
          color:#64748b;
          font-size:10px;
        }

        .placar-hero {
          min-width:175px;
          padding:13px 15px;
          border-radius:11px;
          background:#082e69;
          color:#fff;
        }

        .placar-hero > span {
          display:block;
          font-size:7px;
          font-weight:900;
          opacity:.65;
          text-transform:uppercase;
        }

        .placar-hero div {
          display:flex;
          align-items:center;
          gap:10px;
          margin-top:4px;
        }

        .placar-hero strong {
          font-size:27px;
        }

        .placar-hero b {
          opacity:.5;
        }

        .indicadores {
          display:grid;
          grid-template-columns:
            repeat(4,1fr);
          gap:8px;
          margin-top:10px;
        }

        .indicador {
          padding:12px 14px;
          border:1px solid #dce5f0;
          border-radius:10px;
          background:#fff;
        }

        .indicador span {
          display:block;
          color:#94a3b8;
          font-size:6px;
          font-weight:900;
        }

        .indicador strong {
          display:block;
          margin-top:3px;
          color:#082e69;
          font-size:19px;
        }

        .aviso {
          margin-top:10px;
          padding:12px 14px;
          border:1px solid #efd89f;
          border-radius:9px;
          background:#fff9e9;
          color:#8a6514;
          font-size:9px;
          font-weight:700;
        }

        .card {
          margin-top:10px;
          padding:17px;
          border:1px solid #dce5f0;
          border-radius:13px;
          background:#fff;
        }

        .titulo {
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap:15px;
          margin-bottom:14px;
        }

        .titulo span,
        .finalizar span,
        .finalizada span {
          color:#168447;
          font-size:6px;
          font-weight:900;
          letter-spacing:.07em;
        }

        .titulo h2,
        .finalizar h2,
        .finalizada h2 {
          margin:2px 0;
          color:#082e69;
          font-size:16px;
        }

        .titulo p,
        .finalizar p,
        .finalizada p {
          margin:0;
          color:#94a3b8;
          font-size:8px;
        }

        .botao {
          min-height:38px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:0 13px;
          border:0;
          border-radius:8px;
          font-size:8px;
          font-weight:900;
          text-decoration:none;
          cursor:pointer;
        }

        .salvar,
        .eventos {
          background:#082e69;
          color:#fff;
        }

        .tabela-wrap {
          overflow-x:auto;
        }

        table {
          width:100%;
          border-collapse:collapse;
        }

        th {
          padding:8px;
          border-bottom:2px solid #e2e8f0;
          color:#64748b;
          font-size:7px;
          text-align:left;
          text-transform:uppercase;
        }

        td {
          padding:9px 8px;
          border-bottom:1px solid #edf1f5;
        }

        .atleta {
          min-width:180px;
          display:flex;
          align-items:center;
          gap:8px;
        }

        .avatar {
          flex:0 0 32px;
          width:32px;
          height:32px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:50%;
          background:#eaf2ff;
          color:#1763d6;
          font-size:8px;
          font-weight:900;
        }

        .atleta strong {
          display:block;
          color:#082e69;
          font-size:9px;
        }

        .atleta small {
          display:block;
          margin-top:2px;
          color:#94a3b8;
          font-size:6px;
        }

        .input {
          width:100%;
          min-width:100px;
          height:36px;
          padding:0 8px;
          border:1px solid #cbd5e1;
          border-radius:7px;
          background:#fff;
          font-size:9px;
        }

        .input.numero {
          min-width:65px;
          max-width:75px;
        }

        .centro {
          text-align:center;
        }

        .centro input {
          width:16px;
          height:16px;
          accent-color:#168447;
        }

        .placar-form {
          display:flex;
          align-items:flex-end;
          justify-content:center;
          gap:20px;
          margin:5px 0 20px;
        }

        .placar-form > div {
          min-width:180px;
          text-align:center;
        }

        .placar-form span {
          display:block;
          margin-bottom:6px;
          color:#64748b;
          font-size:8px;
          font-weight:900;
        }

        .placar-form input {
          width:90px;
          height:65px;
          border:1px solid #cbd5e1;
          border-radius:10px;
          color:#082e69;
          font-size:28px;
          font-weight:900;
          text-align:center;
        }

        .placar-form > b {
          padding-bottom:20px;
          color:#94a3b8;
          font-size:18px;
        }

        .grid-dados {
          display:grid;
          grid-template-columns:
            repeat(4,1fr);
          gap:10px;
        }

        .campo label,
        .campo-texto label {
          display:block;
          margin-bottom:5px;
          color:#475569;
          font-size:8px;
          font-weight:900;
        }

        .campo input {
          width:100%;
          height:39px;
          padding:0 9px;
          border:1px solid #cbd5e1;
          border-radius:8px;
          font-size:9px;
        }

        .campo-texto {
          margin-top:10px;
        }

        .campo-texto textarea {
          width:100%;
          padding:10px;
          border:1px solid #cbd5e1;
          border-radius:8px;
          font-size:9px;
          resize:vertical;
        }

        input:disabled,
        select:disabled,
        textarea:disabled {
          background:#f8fafc;
          color:#94a3b8;
        }

        .resumo-eventos {
          display:grid;
          grid-template-columns:
            repeat(2,1fr);
          gap:8px;
        }

        .resumo-eventos div {
          padding:13px;
          border-radius:9px;
          background:#f8fafc;
        }

        .resumo-eventos span {
          display:block;
          color:#94a3b8;
          font-size:7px;
          font-weight:900;
        }

        .resumo-eventos strong {
          display:block;
          margin-top:3px;
          color:#082e69;
          font-size:19px;
        }

        .finalizar,
        .finalizada {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
        }

        .finalizacao {
          border-left:
            4px solid #168447;
        }

        .finalizar-botao {
          background:#168447;
          color:#fff;
        }

        .placar-final {
          display:flex;
          align-items:center;
          gap:10px;
          color:#082e69;
          font-size:28px;
        }

        .placar-final b {
          color:#94a3b8;
          font-size:14px;
        }

        .vazio {
          padding:28px;
          border:1px dashed #cbd5e1;
          border-radius:9px;
          color:#94a3b8;
          font-size:9px;
          text-align:center;
        }

        @media(max-width:900px) {
          .grid-dados {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media(max-width:700px) {
          .pagina {
            padding:14px 10px 30px;
          }

          .hero {
            align-items:flex-start;
            flex-direction:column;
          }

          .placar-hero {
            width:100%;
          }

          .indicadores {
            grid-template-columns:
              repeat(2,1fr);
          }

          .titulo,
          .finalizar,
          .finalizada {
            align-items:stretch;
            flex-direction:column;
          }

          .placar-form {
            gap:8px;
          }

          .placar-form > div {
            min-width:0;
            flex:1;
          }

          .placar-form input {
            width:75px;
          }

          .grid-dados {
            grid-template-columns:1fr;
          }

          .botao {
            width:100%;
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
      <span>
        {titulo.toUpperCase()}
      </span>

      <strong>{valor}</strong>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  defaultValue,
  disabled = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?:
    | string
    | number
    | null;
  disabled?: boolean;
}) {
  return (
    <div className="campo">
      <label htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        min={
          type === "number"
            ? 0
            : undefined
        }
        defaultValue={
          defaultValue ?? ""
        }
        disabled={disabled}
      />
    </div>
  );
}

function nomeStatus(
  status: string
) {
  const mapa: Record<
    string,
    string
  > = {
    rascunho:
      "Rascunho",
    em_preenchimento:
      "Em preenchimento",
    finalizada:
      "Finalizada",
    reaberta:
      "Reaberta",
  };

  return mapa[status] || status;
}

function formatarData(
  data: string
) {
  const [
    ano,
    mes,
    dia,
  ] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function iniciais(
  nome: string
) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (parte) =>
        parte[0]
    )
    .join("")
    .toUpperCase();
}