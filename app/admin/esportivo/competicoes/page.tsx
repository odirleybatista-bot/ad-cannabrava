import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Competicao = {
  id: string;
  nome: string;
  temporada: string | null;
  tipo: string | null;
  formato: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: string | null;
  criado_em: string | null;
};

function formatarData(data: string | null) {
  if (!data) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${data}T12:00:00`));
}

function statusLabel(status: string | null) {
  const mapa: Record<string, string> = {
    planejamento: "Planejamento",
    prevista: "Prevista",
    em_andamento: "Em andamento",
    finalizada: "Finalizada",
    encerrada: "Encerrada",
    cancelada: "Cancelada",
  };

  return mapa[status || ""] || status || "Planejamento";
}

export default async function CompeticoesPage({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    temporada?: string;
    status?: string;
  }>;
}) {
  const filtros = await searchParams;

  const busca = filtros.busca?.trim() || "";
  const temporada = filtros.temporada || "";
  const status = filtros.status || "";

  const supabase = await createClient();

  let query = supabase
    .from("competicoes")
    .select(`
      id,
      nome,
      temporada,
      tipo,
      formato,
      data_inicio,
      data_fim,
      status,
      criado_em
    `)
    .order("criado_em", {
      ascending: false,
    });

  if (busca) {
    query = query.ilike("nome", `%${busca}%`);
  }

  if (temporada) {
    query = query.eq("temporada", temporada);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Erro ao carregar competições:",
      error
    );
  }

  const competicoes =
    (data || []) as Competicao[];

  const { data: todas } = await supabase
    .from("competicoes")
    .select("id, temporada, status");

  const listaCompleta = todas || [];

  const total = listaCompleta.length;

  const emAndamento =
    listaCompleta.filter(
      (item) => item.status === "em_andamento"
    ).length;

  const planejadas =
    listaCompleta.filter((item) =>
      [
        "planejamento",
        "prevista",
      ].includes(item.status || "")
    ).length;

  const finalizadas =
    listaCompleta.filter((item) =>
      [
        "finalizada",
        "encerrada",
      ].includes(item.status || "")
    ).length;

  const temporadas = Array.from(
    new Set(
      listaCompleta
        .map((item) => item.temporada)
        .filter(Boolean)
    )
  )
    .map(String)
    .sort()
    .reverse();

  return (
    <main className="pagina">
      <section className="cabecalho">
        <div>
          <span className="identificador">
            GESTÃO ESPORTIVA
          </span>

          <h1>Competições</h1>

          <p>
            Cadastre e acompanhe campeonatos,
            torneios e demais competições da
            Associação Desportiva Cannabrava.
          </p>
        </div>

        <Link
          href="/admin/esportivo/competicoes/nova"
          className="nova"
        >
          + Nova competição
        </Link>
      </section>

      <section className="indicadores">
        <div className="indicador">
          <div className="indicador-topo">
            <span>TOTAL</span>
            <i className="ponto azul" />
          </div>

          <strong>{total}</strong>
          <small>competições cadastradas</small>
        </div>

        <div className="indicador">
          <div className="indicador-topo">
            <span>EM ANDAMENTO</span>
            <i className="ponto verde" />
          </div>

          <strong>{emAndamento}</strong>
          <small>competições ativas</small>
        </div>

        <div className="indicador">
          <div className="indicador-topo">
            <span>PLANEJADAS</span>
            <i className="ponto laranja" />
          </div>

          <strong>{planejadas}</strong>
          <small>aguardando início</small>
        </div>

        <div className="indicador">
          <div className="indicador-topo">
            <span>FINALIZADAS</span>
            <i className="ponto cinza" />
          </div>

          <strong>{finalizadas}</strong>
          <small>histórico esportivo</small>
        </div>
      </section>

      <section className="painel">
        <div className="painel-topo">
          <div>
            <span className="label">
              LISTAGEM
            </span>

            <h2>
              Competições cadastradas
            </h2>
          </div>

          <span className="quantidade">
            {competicoes.length}
          </span>
        </div>

        <form className="filtros">
          <div className="campo busca">
            <label htmlFor="busca">
              Buscar
            </label>

            <input
              id="busca"
              name="busca"
              defaultValue={busca}
              placeholder="Nome da competição"
            />
          </div>

          <div className="campo">
            <label htmlFor="temporada">
              Temporada
            </label>

            <select
              id="temporada"
              name="temporada"
              defaultValue={temporada}
            >
              <option value="">
                Todas
              </option>

              {temporadas.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="status">
              Situação
            </label>

            <select
              id="status"
              name="status"
              defaultValue={status}
            >
              <option value="">
                Todas
              </option>

              <option value="planejamento">
                Planejamento
              </option>

              <option value="prevista">
                Prevista
              </option>

              <option value="em_andamento">
                Em andamento
              </option>

              <option value="finalizada">
                Finalizada
              </option>

              <option value="encerrada">
                Encerrada
              </option>

              <option value="cancelada">
                Cancelada
              </option>
            </select>
          </div>

          <div className="acoes-filtro">
            <button type="submit">
              Filtrar
            </button>

            <Link href="/admin/esportivo/competicoes">
              Limpar
            </Link>
          </div>
        </form>

        {competicoes.length === 0 ? (
          <div className="vazio">
            <div className="vazio-icone">
              CP
            </div>

            <h3>
              Nenhuma competição encontrada
            </h3>

            <p>
              Cadastre a primeira competição ou
              altere os filtros utilizados.
            </p>

            <Link
              href="/admin/esportivo/competicoes/nova"
            >
              Cadastrar competição
            </Link>
          </div>
        ) : (
          <>
            <div className="tabela desktop">
              <div className="linha cabecalho-tabela">
                <span>COMPETIÇÃO</span>
                <span>TEMPORADA</span>
                <span>TIPO / FORMATO</span>
                <span>PERÍODO</span>
                <span>SITUAÇÃO</span>
                <span />
              </div>

              {competicoes.map(
                (competicao) => (
                  <Link
                    key={competicao.id}
                    href={`/admin/esportivo/competicoes/${competicao.id}`}
                    className="linha linha-dados"
                  >
                    <div className="competicao">
                      <div className="icone">
                        CP
                      </div>

                      <div>
                        <strong>
                          {competicao.nome}
                        </strong>

                        <small>
                          Competição esportiva
                        </small>
                      </div>
                    </div>

                    <span>
                      {competicao.temporada ||
                        "—"}
                    </span>

                    <div className="tipo">
                      <strong>
                        {competicao.tipo ||
                          "Campeonato"}
                      </strong>

                      <small>
                        {competicao.formato ||
                          "Formato não definido"}
                      </small>
                    </div>

                    <div className="periodo">
                      <strong>
                        {formatarData(
                          competicao.data_inicio
                        )}
                      </strong>

                      <small>
                        até{" "}
                        {formatarData(
                          competicao.data_fim
                        )}
                      </small>
                    </div>

                    <span
                      className={`status status-${competicao.status}`}
                    >
                      {statusLabel(
                        competicao.status
                      )}
                    </span>

                    <span className="seta">
                      ›
                    </span>
                  </Link>
                )
              )}
            </div>

            <div className="mobile-lista">
              {competicoes.map(
                (competicao) => (
                  <Link
                    key={competicao.id}
                    href={`/admin/esportivo/competicoes/${competicao.id}`}
                    className="mobile-card"
                  >
                    <div className="mobile-topo">
                      <div className="competicao">
                        <div className="icone">
                          CP
                        </div>

                        <div>
                          <strong>
                            {competicao.nome}
                          </strong>

                          <small>
                            {competicao.temporada ||
                              "Temporada não informada"}
                          </small>
                        </div>
                      </div>

                      <span
                        className={`status status-${competicao.status}`}
                      >
                        {statusLabel(
                          competicao.status
                        )}
                      </span>
                    </div>

                    <div className="mobile-info">
                      <div>
                        <span>TIPO</span>
                        <strong>
                          {competicao.tipo ||
                            "Campeonato"}
                        </strong>
                      </div>

                      <div>
                        <span>FORMATO</span>
                        <strong>
                          {competicao.formato ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>INÍCIO</span>
                        <strong>
                          {formatarData(
                            competicao.data_inicio
                          )}
                        </strong>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </>
        )}
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1900px;
          margin: 0 auto;
          padding: 24px 28px 40px;
        }

        .cabecalho {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .identificador {
          color: #168447;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .cabecalho h1 {
          margin: 3px 0 3px;
          color: #082e69;
          font-size: 29px;
        }

        .cabecalho p {
          max-width: 700px;
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.45;
        }

        .nova {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 15px;
          border-radius: 9px;
          background: #082e69;
          color: white;
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .indicador {
          min-height: 100px;
          padding: 14px 15px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .indicador-topo {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .indicador-topo span {
          color: #64748b;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .05em;
        }

        .ponto {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .azul {
          background: #1763d6;
        }

        .verde {
          background: #168447;
        }

        .laranja {
          background: #d97706;
        }

        .cinza {
          background: #94a3b8;
        }

        .indicador strong {
          display: block;
          margin-top: 10px;
          color: #082e69;
          font-size: 23px;
        }

        .indicador small {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 8.5px;
        }

        .painel {
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: #fff;
        }

        .painel-topo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 66px;
          padding: 13px 16px;
          border-bottom: 1px solid #edf1f5;
        }

        .label {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .painel-topo h2 {
          margin: 2px 0 0;
          color: #082e69;
          font-size: 16px;
        }

        .quantidade {
          min-width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eef5ff;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
        }

        .filtros {
          display: grid;
          grid-template-columns:
            minmax(220px, 1fr)
            180px
            190px
            auto;
          gap: 9px;
          align-items: end;
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #edf1f5;
        }

        .campo label {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 7.5px;
          font-weight: 900;
          letter-spacing: .04em;
        }

        .campo input,
        .campo select {
          width: 100%;
          height: 37px;
          padding: 0 10px;
          border: 1px solid #d6e0eb;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #334155;
          font-size: 9.5px;
        }

        .campo input:focus,
        .campo select:focus {
          border-color: #1763d6;
        }

        .acoes-filtro {
          display: flex;
          gap: 6px;
        }

        .acoes-filtro button,
        .acoes-filtro a {
          height: 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .acoes-filtro button {
          border: 0;
          background: #082e69;
          color: white;
          cursor: pointer;
        }

        .acoes-filtro a {
          border: 1px solid #d6e0eb;
          background: white;
          color: #64748b;
        }

        .linha {
          display: grid;
          grid-template-columns:
            minmax(240px, 1.4fr)
            105px
            minmax(150px, .9fr)
            135px
            130px
            25px;
          gap: 12px;
          align-items: center;
        }

        .cabecalho-tabela {
          min-height: 34px;
          padding: 0 16px;
          background: #fbfcfd;
          color: #8795a8;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .04em;
        }

        .linha-dados {
          min-height: 63px;
          padding: 8px 16px;
          border-top: 1px solid #edf1f5;
          color: #536178;
          font-size: 9.5px;
          text-decoration: none;
        }

        .linha-dados:hover {
          background: #fbfcfe;
        }

        .competicao {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .icone {
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #eaf2ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .competicao strong,
        .tipo strong,
        .periodo strong {
          display: block;
          color: #082e69;
          font-size: 10px;
        }

        .competicao small,
        .tipo small,
        .periodo small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 8px;
        }

        .competicao strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status {
          width: fit-content;
          padding: 5px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 7.5px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-em_andamento {
          background: #e7f7ee;
          color: #168447;
        }

        .status-planejamento,
        .status-prevista {
          background: #fff5e8;
          color: #b96900;
        }

        .status-finalizada,
        .status-encerrada {
          background: #eef2f7;
          color: #64748b;
        }

        .status-cancelada {
          background: #fff1f2;
          color: #b91c1c;
        }

        .seta {
          color: #94a3b8;
          font-size: 18px;
        }

        .vazio {
          padding: 55px 20px;
          text-align: center;
        }

        .vazio-icone {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
        }

        .vazio h3 {
          margin: 0;
          color: #082e69;
          font-size: 14px;
        }

        .vazio p {
          margin: 6px 0 14px;
          color: #94a3b8;
          font-size: 9px;
        }

        .vazio a {
          display: inline-flex;
          padding: 9px 12px;
          border-radius: 8px;
          background: #082e69;
          color: white;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .mobile-lista {
          display: none;
        }

        @media (max-width: 900px) {
          .filtros {
            grid-template-columns:
              1fr 1fr;
          }

          .acoes-filtro {
            align-self: end;
          }

          .desktop {
            display: none;
          }

          .mobile-lista {
            display: block;
          }

          .mobile-card {
            display: block;
            padding: 13px;
            border-bottom: 1px solid #edf1f5;
            text-decoration: none;
          }

          .mobile-card:last-child {
            border-bottom: 0;
          }

          .mobile-topo {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
          }

          .mobile-topo .competicao {
            flex: 1;
            min-width: 0;
          }

          .mobile-info {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 8px;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #edf1f5;
          }

          .mobile-info span {
            display: block;
            color: #94a3b8;
            font-size: 6.5px;
            font-weight: 900;
          }

          .mobile-info strong {
            display: block;
            margin-top: 2px;
            color: #334155;
            font-size: 8.5px;
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 16px 11px 28px;
          }

          .cabecalho {
            display: block;
          }

          .cabecalho h1 {
            font-size: 25px;
          }

          .cabecalho p {
            font-size: 10px;
          }

          .nova {
            width: 100%;
            margin-top: 12px;
          }

          .indicadores {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 7px;
          }

          .indicador {
            min-height: 88px;
            padding: 11px;
          }

          .indicador strong {
            margin-top: 8px;
            font-size: 20px;
          }

          .filtros {
            grid-template-columns: 1fr;
            padding: 11px 12px;
          }

          .acoes-filtro {
            width: 100%;
          }

          .acoes-filtro button,
          .acoes-filtro a {
            flex: 1;
          }

          .painel-topo {
            padding: 11px 13px;
          }

          .mobile-card {
            padding: 12px;
          }

          .mobile-topo {
            align-items: center;
          }

          .mobile-topo .status {
            flex: 0 0 auto;
          }

          .mobile-info {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 390px) {
          .pagina {
            padding-left: 8px;
            padding-right: 8px;
          }

          .indicadores {
            gap: 5px;
          }

          .mobile-info {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}