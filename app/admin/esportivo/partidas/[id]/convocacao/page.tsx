import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  salvarConvocacao,
  publicarConvocacao,
  encerrarConvocacao,
  reabrirConvocacao,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConvocacaoPage({
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
        modalidade,
        data_jogo,
        horario,
        local,
        tipo,
        status
      `)
      .eq("id", id)
      .maybeSingle();

  if (!partida) {
    notFound();
  }

  let {
    data: convocacao,
  } =
    await supabase
      .from("convocacoes")
      .select(`
        id,
        status,
        mensagem,
        limite_confirmacao,
        publicada_em,
        encerrada_em
      `)
      .eq(
        "partida_id",
        id
      )
      .maybeSingle();

  if (!convocacao) {
    const {
      data: usuarioId,
    } =
      await supabase.rpc(
        "usuario_id_atual"
      );

    const {
      data: nova,
      error,
    } =
      await supabase
        .from("convocacoes")
        .insert({
          partida_id: id,
          status: "rascunho",
          criado_por:
            usuarioId || null,
        })
        .select(`
          id,
          status,
          mensagem,
          limite_confirmacao,
          publicada_em,
          encerrada_em
        `)
        .single();

    if (
      error ||
      !nova
    ) {
      throw new Error(
        error?.message ||
          "Não foi possível criar a convocação."
      );
    }

    convocacao = nova;
  }

  const {
    data: atletas,
  } =
    await supabase
      .from("atletas")
      .select(`
        id,
        nome,
        apelido,
        modalidade,
        posicao,
        numero_camisa,
        status
      `)
      .eq(
        "status",
        "ativo"
      )
      .order(
        "nome",
        {
          ascending: true,
        }
      );

  const {
    data: convocados,
  } =
    await supabase
      .from(
        "convocacao_atletas"
      )
      .select(`
        id,
        atleta_id,
        resposta,
        resposta_em,
        observacao_atleta
      `)
      .eq(
        "convocacao_id",
        convocacao.id
      );

  const atletasModalidade =
    (atletas || []).filter(
      (atleta: any) =>
        !partida.modalidade ||
        !atleta.modalidade ||
        atleta.modalidade
          .toLowerCase()
          .trim() ===
          partida.modalidade
            .toLowerCase()
            .trim()
    );

  const idsConvocados =
    new Set(
      (convocados || []).map(
        (item: any) =>
          item.atleta_id
      )
    );

  const total =
    convocados?.length || 0;

  const confirmados =
    convocados?.filter(
      (item: any) =>
        item.resposta ===
        "confirmado"
    ).length || 0;

  const indisponiveis =
    convocados?.filter(
      (item: any) =>
        item.resposta ===
        "indisponivel"
    ).length || 0;

  const pendentes =
    convocados?.filter(
      (item: any) =>
        item.resposta ===
        "pendente"
    ).length || 0;

  const podeEditar =
    convocacao.status !==
      "encerrada" &&
    convocacao.status !==
      "cancelada";

  const salvar =
    salvarConvocacao.bind(
      null,
      id,
      convocacao.id
    );

  const publicar =
    publicarConvocacao.bind(
      null,
      id,
      convocacao.id
    );

  const encerrar =
    encerrarConvocacao.bind(
      null,
      id,
      convocacao.id
    );

  const reabrir =
    reabrirConvocacao.bind(
      null,
      id,
      convocacao.id
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
            GESTÃO ESPORTIVA • CONVOCAÇÃO
          </span>

          <h1>
            A.D. Cannabrava
            <span> x </span>
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

        <div className="status">
          <span>
            CONVOCAÇÃO
          </span>

          <strong>
            {nomeStatus(
              convocacao.status
            )}
          </strong>
        </div>
      </section>

      <section className="indicadores">
        <Indicador
          titulo="Convocados"
          valor={total}
        />

        <Indicador
          titulo="Confirmados"
          valor={confirmados}
        />

        <Indicador
          titulo="Pendentes"
          valor={pendentes}
        />

        <Indicador
          titulo="Indisponíveis"
          valor={indisponiveis}
        />
      </section>

      <form
        action={salvar}
        className="conteudo"
      >
        <section className="card">
          <div className="titulo-card">
            <div>
              <span>
                COMUNICAÇÃO
              </span>

              <h2>
                Informações da convocação
              </h2>

              <p>
                Mensagem enviada aos
                atletas e prazo para
                confirmação.
              </p>
            </div>
          </div>

          <div className="grid-info">
            <div className="campo mensagem">
              <label htmlFor="mensagem">
                Mensagem
              </label>

              <textarea
                id="mensagem"
                name="mensagem"
                rows={4}
                disabled={
                  !podeEditar
                }
                defaultValue={
                  convocacao.mensagem ||
                  "Você foi convocado para representar a A.D. Cannabrava nesta partida. Confirme sua disponibilidade pelo Portal do Atleta."
                }
              />
            </div>

            <div className="campo">
              <label htmlFor="limite_confirmacao">
                Prazo para confirmação
              </label>

              <input
                id="limite_confirmacao"
                name="limite_confirmacao"
                type="datetime-local"
                disabled={
                  !podeEditar
                }
                defaultValue={
                  formatarDataInput(
                    convocacao.limite_confirmacao
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className="card">
          <div className="titulo-card linha">
            <div>
              <span>
                ELENCO
              </span>

              <h2>
                Selecionar atletas
              </h2>

              <p>
                Apenas atletas ativos
                aparecem nesta relação.
              </p>
            </div>

            <div className="contador">
              {
                atletasModalidade.length
              }{" "}
              disponíveis
            </div>
          </div>

          {atletasModalidade.length ===
          0 ? (
            <div className="vazio">
              Nenhum atleta ativo
              disponível para esta
              modalidade.
            </div>
          ) : (
            <div className="atletas">
              {atletasModalidade.map(
                (atleta: any) => {
                  const registro =
                    convocados?.find(
                      (item: any) =>
                        item.atleta_id ===
                        atleta.id
                    );

                  return (
                    <label
                      key={atleta.id}
                      className={
                        idsConvocados.has(
                          atleta.id
                        )
                          ? "atleta selecionado"
                          : "atleta"
                      }
                    >
                      <input
                        type="checkbox"
                        name="atleta_id"
                        value={
                          atleta.id
                        }
                        defaultChecked={
                          idsConvocados.has(
                            atleta.id
                          )
                        }
                        disabled={
                          !podeEditar
                        }
                      />

                      <div className="avatar">
                        {iniciais(
                          atleta.apelido ||
                            atleta.nome
                        )}
                      </div>

                      <div className="dados">
                        <strong>
                          {atleta.apelido ||
                            atleta.nome}
                        </strong>

                        {atleta.apelido && (
                          <small>
                            {atleta.nome}
                          </small>
                        )}

                        <div className="meta">
                          <span>
                            {atleta.posicao ||
                              "Sem posição"}
                          </span>

                          {atleta.numero_camisa && (
                            <span>
                              Nº{" "}
                              {
                                atleta.numero_camisa
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {registro && (
                        <Resposta
                          resposta={
                            registro.resposta
                          }
                        />
                      )}
                    </label>
                  );
                }
              )}
            </div>
          )}
        </section>

        {podeEditar && (
          <div className="barra-salvar">
            <div>
              <strong>
                Salvar alterações
              </strong>

              <span>
                A publicação é feita
                separadamente.
              </span>
            </div>

            <button
              type="submit"
              className="botao primario"
            >
              Salvar convocação
            </button>
          </div>
        )}
      </form>

      <section className="card gerenciamento">
        <div className="titulo-card">
          <div>
            <span>
              PUBLICAÇÃO
            </span>

            <h2>
              Controle da convocação
            </h2>

            <p>
              Publique para liberar
              a confirmação aos atletas.
            </p>
          </div>
        </div>

        <div className="acoes">
          {convocacao.status ===
            "rascunho" && (
            <form action={publicar}>
              <button
                type="submit"
                className="botao publicar"
              >
                Publicar convocação
              </button>
            </form>
          )}

          {convocacao.status ===
            "aberta" && (
            <>
              <div className="publicada">
                <strong>
                  Convocação publicada
                </strong>

                <span>
                  Os atletas convocados
                  já podem responder
                  pelo portal.
                </span>
              </div>

              <form action={encerrar}>
                <button
                  type="submit"
                  className="botao encerrar"
                >
                  Encerrar confirmações
                </button>
              </form>
            </>
          )}

          {convocacao.status ===
            "encerrada" && (
            <>
              <div className="publicada">
                <strong>
                  Convocação encerrada
                </strong>

                <span>
                  As confirmações foram
                  fechadas.
                </span>
              </div>

              <form action={reabrir}>
                <button
                  type="submit"
                  className="botao secundario"
                >
                  Reabrir convocação
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {convocados &&
        convocados.length > 0 && (
          <section className="card">
            <div className="titulo-card">
              <div>
                <span>
                  RETORNO DOS ATLETAS
                </span>

                <h2>
                  Situação das respostas
                </h2>

                <p>
                  Acompanhamento das
                  confirmações recebidas.
                </p>
              </div>
            </div>

            <div className="respostas">
              {convocados.map(
                (item: any) => {
                  const atleta =
                    atletasModalidade.find(
                      (a: any) =>
                        a.id ===
                        item.atleta_id
                    );

                  if (!atleta) {
                    return null;
                  }

                  return (
                    <div
                      key={item.id}
                      className="resposta-linha"
                    >
                      <div>
                        <strong>
                          {atleta.apelido ||
                            atleta.nome}
                        </strong>

                        <span>
                          {atleta.posicao ||
                            "Posição não informada"}
                        </span>
                      </div>

                      <Resposta
                        resposta={
                          item.resposta
                        }
                      />
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

      <style>{`
        .pagina {
          width:100%;
          max-width:1450px;
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
          justify-content:space-between;
          align-items:center;
          gap:20px;
          padding:21px;
          border:1px solid #dce5f0;
          border-radius:15px;
          background:linear-gradient(
            135deg,
            #fff,
            #f5f9fd
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

        .hero h1 span {
          color:#94a3b8;
          font-weight:500;
        }

        .hero p {
          margin:0;
          color:#64748b;
          font-size:10px;
        }

        .status {
          min-width:165px;
          padding:13px 15px;
          border-radius:11px;
          background:#082e69;
          color:#fff;
        }

        .status span {
          display:block;
          font-size:6px;
          font-weight:900;
          opacity:.65;
        }

        .status strong {
          display:block;
          margin-top:3px;
          font-size:17px;
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

        .conteudo {
          display:grid;
          gap:10px;
          margin-top:10px;
        }

        .card {
          margin-top:10px;
          padding:17px;
          border:1px solid #dce5f0;
          border-radius:13px;
          background:#fff;
        }

        .conteudo .card {
          margin-top:0;
        }

        .titulo-card {
          margin-bottom:14px;
        }

        .titulo-card.linha {
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap:15px;
        }

        .titulo-card span {
          color:#168447;
          font-size:6px;
          font-weight:900;
          letter-spacing:.06em;
        }

        .titulo-card h2 {
          margin:2px 0;
          color:#082e69;
          font-size:16px;
        }

        .titulo-card p {
          margin:0;
          color:#94a3b8;
          font-size:8px;
        }

        .contador {
          color:#64748b;
          font-size:8px;
          font-weight:900;
        }

        .grid-info {
          display:grid;
          grid-template-columns:2fr 1fr;
          gap:12px;
        }

        .campo label {
          display:block;
          margin-bottom:5px;
          color:#475569;
          font-size:8px;
          font-weight:900;
        }

        .campo input,
        .campo textarea {
          width:100%;
          border:1px solid #cbd5e1;
          border-radius:8px;
          background:#fff;
          color:#1e293b;
          font-size:10px;
          outline:none;
        }

        .campo input {
          height:42px;
          padding:0 10px;
        }

        .campo textarea {
          min-height:93px;
          padding:10px;
          resize:vertical;
        }

        .campo input:disabled,
        .campo textarea:disabled {
          background:#f8fafc;
          color:#94a3b8;
        }

        .atletas {
          display:grid;
          grid-template-columns:
            repeat(3,1fr);
          gap:8px;
        }

        .atleta {
          position:relative;
          display:flex;
          align-items:center;
          gap:10px;
          padding:11px;
          border:1px solid #e2e8f0;
          border-radius:10px;
          background:#fff;
          cursor:pointer;
          transition:.15s ease;
        }

        .atleta:hover {
          border-color:#9dbbe4;
          background:#fafcff;
        }

        .atleta.selecionado {
          border-color:#8bc5a4;
          background:#f5fbf7;
        }

        .atleta input {
          width:16px;
          height:16px;
          accent-color:#168447;
        }

        .avatar {
          flex:0 0 35px;
          width:35px;
          height:35px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:50%;
          background:#eaf2ff;
          color:#1763d6;
          font-size:9px;
          font-weight:900;
        }

        .dados {
          min-width:0;
          flex:1;
        }

        .dados strong {
          display:block;
          overflow:hidden;
          color:#082e69;
          font-size:10px;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .dados small {
          display:block;
          margin-top:2px;
          overflow:hidden;
          color:#94a3b8;
          font-size:7px;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .meta {
          display:flex;
          flex-wrap:wrap;
          gap:5px;
          margin-top:5px;
        }

        .meta span {
          padding:3px 5px;
          border-radius:5px;
          background:#f1f5f9;
          color:#64748b;
          font-size:6px;
          font-weight:900;
        }

        .resposta {
          flex:0 0 auto;
          padding:4px 6px;
          border-radius:999px;
          font-size:6px;
          font-weight:900;
        }

        .resposta.confirmado {
          background:#e6f7ed;
          color:#168447;
        }

        .resposta.indisponivel {
          background:#fff0f0;
          color:#b42318;
        }

        .resposta.pendente {
          background:#fff7e6;
          color:#b76e00;
        }

        .barra-salvar {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:15px;
          padding:13px 16px;
          border:1px solid #dce5f0;
          border-radius:11px;
          background:#f8fafc;
        }

        .barra-salvar strong {
          display:block;
          color:#334155;
          font-size:9px;
        }

        .barra-salvar span {
          display:block;
          margin-top:2px;
          color:#94a3b8;
          font-size:7px;
        }

        .botao {
          min-height:39px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:0 14px;
          border:0;
          border-radius:8px;
          color:#fff;
          font-size:8px;
          font-weight:900;
          cursor:pointer;
        }

        .primario,
        .publicar {
          background:#082e69;
        }

        .encerrar {
          background:#b42318;
        }

        .secundario {
          border:1px solid #cbd5e1;
          background:#fff;
          color:#334155;
        }

        .acoes {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:15px;
        }

        .publicada strong {
          display:block;
          color:#168447;
          font-size:10px;
        }

        .publicada span {
          display:block;
          margin-top:2px;
          color:#64748b;
          font-size:8px;
        }

        .respostas {
          display:grid;
          gap:6px;
        }

        .resposta-linha {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:9px 11px;
          border-radius:8px;
          background:#f8fafc;
        }

        .resposta-linha strong {
          display:block;
          color:#334155;
          font-size:9px;
        }

        .resposta-linha > div > span {
          display:block;
          margin-top:2px;
          color:#94a3b8;
          font-size:7px;
        }

        .vazio {
          padding:30px;
          border:1px dashed #cbd5e1;
          border-radius:9px;
          color:#94a3b8;
          font-size:9px;
          text-align:center;
        }

        @media(max-width:1050px) {
          .atletas {
            grid-template-columns:
              repeat(2,1fr);
          }

          .grid-info {
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

          .status {
            width:100%;
          }

          .indicadores {
            grid-template-columns:
              repeat(2,1fr);
          }

          .atletas {
            grid-template-columns:1fr;
          }

          .barra-salvar,
          .acoes {
            align-items:stretch;
            flex-direction:column;
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

function Resposta({
  resposta,
}: {
  resposta: string;
}) {
  const nomes: Record<
    string,
    string
  > = {
    confirmado: "Confirmado",
    indisponivel:
      "Indisponível",
    pendente: "Pendente",
  };

  return (
    <span
      className={`resposta ${resposta}`}
    >
      {nomes[resposta] ||
        resposta}
    </span>
  );
}

function nomeStatus(
  status: string
) {
  const nomes: Record<
    string,
    string
  > = {
    rascunho: "Rascunho",
    aberta: "Aberta",
    encerrada: "Encerrada",
    cancelada: "Cancelada",
  };

  return nomes[status] || status;
}

function formatarData(
  data: string
) {
  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarDataInput(
  data?: string | null
) {
  if (!data) {
    return "";
  }

  const d =
    new Date(data);

  const deslocamento =
    d.getTimezoneOffset() *
    60000;

  return new Date(
    d.getTime() -
      deslocamento
  )
    .toISOString()
    .slice(0, 16);
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