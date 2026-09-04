import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type AtletaRecente = {
  id: string;
  nome: string;
  posicao: string | null;
  modalidade: string | null;
  status: string | null;
  criado_em: string | null;
};

function statusAtleta(status: string | null) {
  const mapa: Record<string, string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados: "Documentos enviados",
    em_analise: "Em análise",
    aprovado: "Aprovado",
    vinculado: "Vinculado",
    ativo: "Ativo",
    suspenso: "Suspenso",
    inativo: "Inativo",
  };

  return mapa[status || ""] || status || "Pendente";
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    atletasAtivosResult,
    atletasTotalResult,
    documentosPendentesResult,
    termosPendentesResult,
    patrocinadoresResult,
    atletasRecentesResult,
  ] = await Promise.all([
    supabase
      .from("atletas")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "ativo"),

    supabase
      .from("atletas")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("atleta_documentos")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("status", [
        "enviado",
        "em_analise",
        "correcao_solicitada",
      ]),

    supabase
      .from("termos_compromisso")
      .select("id", {
        count: "exact",
        head: true,
      })
      .neq("status", "assinado"),

    supabase
      .from("patrocinadores")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("ativo", true),

    supabase
      .from("atletas")
      .select(`
        id,
        nome,
        posicao,
        modalidade,
        status,
        criado_em
      `)
      .order("criado_em", {
        ascending: false,
      })
      .limit(5),
  ]);

  const atletasAtivos =
    atletasAtivosResult.count || 0;

  const totalAtletas =
    atletasTotalResult.count || 0;

  const documentosPendentes =
    documentosPendentesResult.count || 0;

  const termosPendentes =
    termosPendentesResult.count || 0;

  const patrocinadoresAtivos =
    patrocinadoresResult.count || 0;

  const atletasRecentes =
    (atletasRecentesResult.data || []) as AtletaRecente[];

  const percentualAtivos =
    totalAtletas > 0
      ? Math.round(
          (atletasAtivos / totalAtletas) * 100
        )
      : 0;

  return (
    <main className="dashboard">
      <section className="cabecalho">
        <div>
          <span className="identificador">
            PAINEL ADMINISTRATIVO
          </span>

          <h1>Dashboard</h1>

          <p>
            Visão geral da Associação Desportiva Cannabrava.
          </p>
        </div>

        <div className="cabecalho-acoes">
          <Link
            href="/admin/esportivo/atletas"
            className="botao-secundario"
          >
            Ver atletas
          </Link>

          <Link
            href="/admin/esportivo/atletas"
            className="botao-principal"
          >
            + Novo atleta
          </Link>
        </div>
      </section>

      <section className="indicadores">
        <Link
          href="/admin/esportivo/atletas"
          className="indicador"
        >
          <div className="indicador-topo">
            <span>ATLETAS ATIVOS</span>
            <i className="ponto verde" />
          </div>

          <strong>{atletasAtivos}</strong>

          <small>
            {totalAtletas} cadastrados
          </small>
        </Link>

        <Link
          href="/admin/esportivo/atletas"
          className="indicador"
        >
          <div className="indicador-topo">
            <span>CADASTROS</span>
            <i className="ponto azul" />
          </div>

          <strong>{totalAtletas}</strong>

          <small>
            total de atletas
          </small>
        </Link>

        <Link
          href="/admin/esportivo/atletas"
          className="indicador"
        >
          <div className="indicador-topo">
            <span>DOCUMENTOS</span>
            <i className="ponto laranja" />
          </div>

          <strong>{documentosPendentes}</strong>

          <small>
            requerem atenção
          </small>
        </Link>

        <Link
          href="/admin/esportivo/atletas"
          className="indicador"
        >
          <div className="indicador-topo">
            <span>TERMOS</span>
            <i className="ponto roxo" />
          </div>

          <strong>{termosPendentes}</strong>

          <small>
            pendentes
          </small>
        </Link>

        <Link
          href="/admin/financeiro/patrocinadores"
          className="indicador"
        >
          <div className="indicador-topo">
            <span>PATROCINADORES</span>
            <i className="ponto verde" />
          </div>

          <strong>{patrocinadoresAtivos}</strong>

          <small>
            parceiros ativos
          </small>
        </Link>

        <div className="indicador">
          <div className="indicador-topo">
            <span>ATLETAS ATIVOS</span>
            <i className="ponto azul" />
          </div>

          <strong>{percentualAtivos}%</strong>

          <small>
            do cadastro total
          </small>
        </div>
      </section>

      <section className="grade-principal">
        <div className="coluna-principal">
          <section className="card pendencias">
            <div className="card-cabecalho">
              <div>
                <span className="card-label">
                  ACOMPANHAMENTO
                </span>

                <h2>Pendências</h2>
              </div>

              <span className="total-pendencias">
                {documentosPendentes +
                  termosPendentes}
              </span>
            </div>

            <div className="lista-pendencias">
              <Link
                href="/admin/esportivo/atletas"
                className="pendencia"
              >
                <div className="pendencia-icone documento">
                  DOC
                </div>

                <div className="pendencia-info">
                  <strong>
                    Documentos para análise
                  </strong>

                  <span>
                    Documentos enviados pelos atletas
                    aguardando conferência.
                  </span>
                </div>

                <b>{documentosPendentes}</b>

                <span className="seta">›</span>
              </Link>

              <Link
                href="/admin/esportivo/atletas"
                className="pendencia"
              >
                <div className="pendencia-icone termo">
                  TER
                </div>

                <div className="pendencia-info">
                  <strong>
                    Termos pendentes
                  </strong>

                  <span>
                    Termos ainda não concluídos ou
                    assinados.
                  </span>
                </div>

                <b>{termosPendentes}</b>

                <span className="seta">›</span>
              </Link>

              <Link
                href="/admin/financeiro/patrocinadores"
                className="pendencia"
              >
                <div className="pendencia-icone patrocinio">
                  PAT
                </div>

                <div className="pendencia-info">
                  <strong>
                    Gestão de patrocinadores
                  </strong>

                  <span>
                    Acompanhe parceiros e patrocínios
                    cadastrados.
                  </span>
                </div>

                <b>{patrocinadoresAtivos}</b>

                <span className="seta">›</span>
              </Link>
            </div>
          </section>

          <section className="card">
            <div className="card-cabecalho">
              <div>
                <span className="card-label">
                  GESTÃO ESPORTIVA
                </span>

                <h2>Atletas recentes</h2>
              </div>

              <Link
                href="/admin/esportivo/atletas"
                className="ver-todos"
              >
                Ver todos
              </Link>
            </div>

            {atletasRecentes.length === 0 ? (
              <div className="vazio">
                Nenhum atleta cadastrado.
              </div>
            ) : (
              <div className="tabela">
                <div className="tabela-cabecalho">
                  <span>ATLETA</span>
                  <span>MODALIDADE</span>
                  <span>POSIÇÃO</span>
                  <span>STATUS</span>
                </div>

                {atletasRecentes.map(
                  (atleta: AtletaRecente) => (
                    <Link
                      href={`/admin/esportivo/atletas/${atleta.id}`}
                      key={atleta.id}
                      className="linha-atleta"
                    >
                      <div className="atleta-nome">
                        <div className="mini-avatar">
                          {atleta.nome
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map(
                              (nome: string) =>
                                nome[0]
                            )
                            .join("")
                            .toUpperCase()}
                        </div>

                        <strong>
                          {atleta.nome}
                        </strong>
                      </div>

                      <span>
                        {atleta.modalidade ||
                          "Futebol"}
                      </span>

                      <span>
                        {atleta.posicao || "—"}
                      </span>

                      <span
                        className={`badge status-${atleta.status}`}
                      >
                        {statusAtleta(
                          atleta.status
                        )}
                      </span>
                    </Link>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="coluna-lateral">
          <section className="card">
            <div className="card-cabecalho simples">
              <div>
                <span className="card-label">
                  ACESSO RÁPIDO
                </span>

                <h2>Ações rápidas</h2>
              </div>
            </div>

            <div className="acoes-rapidas">
              <Link href="/admin/esportivo/atletas">
                <div className="acao-icone">
                  AT
                </div>

                <div>
                  <strong>
                    Gestão de atletas
                  </strong>

                  <span>
                    Cadastros e documentos
                  </span>
                </div>

                <b>›</b>
              </Link>

              <Link href="/admin/esportivo/competicoes">
                <div className="acao-icone">
                  CP
                </div>

                <div>
                  <strong>
                    Competições
                  </strong>

                  <span>
                    Campeonatos e torneios
                  </span>
                </div>

                <b>›</b>
              </Link>

              <Link href="/admin/esportivo/partidas">
                <div className="acao-icone">
                  PT
                </div>

                <div>
                  <strong>
                    Partidas
                  </strong>

                  <span>
                    Jogos e súmulas
                  </span>
                </div>

                <b>›</b>
              </Link>

              <Link href="/admin/financeiro/patrocinadores">
                <div className="acao-icone">
                  PA
                </div>

                <div>
                  <strong>
                    Patrocinadores
                  </strong>

                  <span>
                    Parceiros do projeto
                  </span>
                </div>

                <b>›</b>
              </Link>

              <Link href="/admin/relatorios/esportivo">
                <div className="acao-icone">
                  RL
                </div>

                <div>
                  <strong>
                    Relatórios
                  </strong>

                  <span>
                    Indicadores esportivos
                  </span>
                </div>

                <b>›</b>
              </Link>
            </div>
          </section>

          <section className="card financeiro">
            <div className="card-cabecalho simples">
              <div>
                <span className="card-label">
                  FINANCEIRO
                </span>

                <h2>Resumo financeiro</h2>
              </div>
            </div>

            <div className="financeiro-linha">
              <span>Contas a receber</span>
              <strong>R$ 0,00</strong>
            </div>

            <div className="financeiro-linha">
              <span>Contas a pagar</span>
              <strong>R$ 0,00</strong>
            </div>

            <div className="financeiro-linha destaque">
              <span>Saldo disponível</span>
              <strong>R$ 0,00</strong>
            </div>

            <Link
              href="/admin/financeiro"
              className="financeiro-link"
            >
              Acessar Gestão Financeira
            </Link>
          </section>
        </aside>
      </section>

      <style>{`
        .dashboard {
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
          margin-bottom: 20px;
        }

        .identificador {
          color: #168447;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .cabecalho h1 {
          margin: 3px 0 2px;
          color: #082e69;
          font-size: 30px;
          line-height: 1.1;
        }

        .cabecalho p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .cabecalho-acoes {
          display: flex;
          gap: 8px;
        }

        .botao-principal,
        .botao-secundario {
          padding: 9px 14px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .botao-principal {
          background: #082e69;
          color: #fff;
        }

        .botao-secundario {
          border: 1px solid #cbd8e8;
          background: #fff;
          color: #082e69;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(6, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .indicador {
          min-height: 104px;
          padding: 14px 15px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
          text-decoration: none;
        }

        .indicador:hover {
          border-color: #aebfd3;
        }

        .indicador-topo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .indicador-topo span {
          color: #64748b;
          font-size: 8.5px;
          font-weight: 900;
          letter-spacing: .055em;
        }

        .ponto {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .verde {
          background: #168447;
        }

        .azul {
          background: #1763d6;
        }

        .laranja {
          background: #d97706;
        }

        .roxo {
          background: #7c3aed;
        }

        .indicador strong {
          display: block;
          margin-top: 10px;
          color: #082e69;
          font-size: 24px;
          line-height: 1;
        }

        .indicador small {
          display: block;
          margin-top: 6px;
          color: #94a3b8;
          font-size: 9px;
        }

        .grade-principal {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 340px;
          gap: 12px;
        }

        .coluna-principal,
        .coluna-lateral {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .card {
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: #fff;
        }

        .card-cabecalho {
          min-height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 13px 16px;
          border-bottom: 1px solid #edf1f5;
        }

        .card-cabecalho.simples {
          min-height: 64px;
        }

        .card-label {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .card-cabecalho h2 {
          margin: 2px 0 0;
          color: #082e69;
          font-size: 16px;
        }

        .total-pendencias {
          min-width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff3e7;
          color: #b96900;
          font-size: 11px;
          font-weight: 900;
        }

        .pendencia {
          display: grid;
          grid-template-columns:
            36px minmax(0, 1fr) auto 15px;
          align-items: center;
          gap: 11px;
          padding: 12px 16px;
          border-bottom: 1px solid #edf1f5;
          color: inherit;
          text-decoration: none;
        }

        .pendencia:last-child {
          border-bottom: 0;
        }

        .pendencia:hover {
          background: #f8fafc;
        }

        .pendencia-icone {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          font-size: 8px;
          font-weight: 900;
        }

        .pendencia-icone.documento {
          background: #eaf2ff;
          color: #1763d6;
        }

        .pendencia-icone.termo {
          background: #f3edff;
          color: #7c3aed;
        }

        .pendencia-icone.patrocinio {
          background: #eaf8ef;
          color: #168447;
        }

        .pendencia-info strong {
          display: block;
          color: #082e69;
          font-size: 11px;
        }

        .pendencia-info span {
          display: block;
          margin-top: 2px;
          color: #7c8a9e;
          font-size: 9px;
        }

        .pendencia > b {
          color: #082e69;
          font-size: 13px;
        }

        .seta {
          color: #94a3b8;
          font-size: 19px;
        }

        .ver-todos {
          color: #1763d6;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .tabela-cabecalho,
        .linha-atleta {
          display: grid;
          grid-template-columns:
            minmax(220px, 1.6fr)
            minmax(110px, .8fr)
            minmax(100px, .8fr)
            minmax(100px, .7fr);
          gap: 12px;
          align-items: center;
        }

        .tabela-cabecalho {
          min-height: 33px;
          padding: 0 16px;
          background: #f8fafc;
          color: #8795a8;
          font-size: 7.5px;
          font-weight: 900;
          letter-spacing: .04em;
        }

        .linha-atleta {
          min-height: 51px;
          padding: 7px 16px;
          border-top: 1px solid #edf1f5;
          color: #536178;
          font-size: 9.5px;
          text-decoration: none;
        }

        .linha-atleta:hover {
          background: #fbfcfe;
        }

        .atleta-nome {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .atleta-nome strong {
          overflow: hidden;
          color: #082e69;
          font-size: 10.5px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mini-avatar {
          flex: 0 0 31px;
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eaf2ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .badge {
          width: fit-content;
          padding: 4px 7px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 8px;
          font-weight: 800;
        }

        .status-ativo {
          background: #e7f7ee;
          color: #168447;
        }

        .status-em_analise,
        .status-documentos_enviados {
          background: #eaf2ff;
          color: #1763d6;
        }

        .vazio {
          padding: 32px 16px;
          color: #94a3b8;
          font-size: 10px;
          text-align: center;
        }

        .acoes-rapidas a {
          display: grid;
          grid-template-columns:
            35px minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-bottom: 1px solid #edf1f5;
          color: inherit;
          text-decoration: none;
        }

        .acoes-rapidas a:last-child {
          border-bottom: 0;
        }

        .acoes-rapidas a:hover {
          background: #f8fafc;
        }

        .acao-icone {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .acoes-rapidas strong {
          display: block;
          color: #082e69;
          font-size: 10px;
        }

        .acoes-rapidas span {
          display: block;
          margin-top: 1px;
          color: #94a3b8;
          font-size: 8px;
        }

        .acoes-rapidas b {
          color: #94a3b8;
          font-size: 17px;
        }

        .financeiro-linha {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 15px;
          border-bottom: 1px solid #edf1f5;
        }

        .financeiro-linha span {
          color: #64748b;
          font-size: 9px;
        }

        .financeiro-linha strong {
          color: #082e69;
          font-size: 11px;
        }

        .financeiro-linha.destaque {
          background: #f8fbff;
        }

        .financeiro-linha.destaque strong {
          color: #168447;
          font-size: 14px;
        }

        .financeiro-link {
          display: block;
          padding: 11px 15px;
          color: #1763d6;
          font-size: 9px;
          font-weight: 800;
          text-align: center;
          text-decoration: none;
        }

        @media (max-width: 1300px) {
          .indicadores {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .grade-principal {
            grid-template-columns:
              minmax(0, 1fr) 300px;
          }
        }

        @media (max-width: 960px) {
          .grade-principal {
            grid-template-columns: 1fr;
          }

          .coluna-lateral {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .dashboard {
            width: 100%;
            max-width: 100%;
            padding: 16px 12px 28px;
            overflow-x: hidden;
          }

          .cabecalho {
            display: block;
            margin-bottom: 15px;
          }

          .identificador {
            font-size: 8px;
          }

          .cabecalho h1 {
            margin-top: 3px;
            font-size: 25px;
          }

          .cabecalho p {
            margin-top: 3px;
            font-size: 10px;
            line-height: 1.4;
          }

          .cabecalho-acoes {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
            margin-top: 13px;
          }

          .botao-principal,
          .botao-secundario {
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 10px;
            font-size: 10px;
            text-align: center;
          }

          .indicadores {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-bottom: 10px;
          }

          .indicador {
            min-width: 0;
            min-height: 92px;
            padding: 12px;
            border-radius: 11px;
          }

          .indicador-topo span {
            font-size: 7px;
            line-height: 1.2;
          }

          .indicador strong {
            margin-top: 8px;
            font-size: 21px;
          }

          .indicador small {
            margin-top: 5px;
            font-size: 8px;
          }

          .grade-principal {
            display: block;
          }

          .coluna-principal,
          .coluna-lateral {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .coluna-lateral {
            margin-top: 10px;
          }

          .card {
            width: 100%;
            min-width: 0;
            border-radius: 12px;
          }

          .card-cabecalho,
          .card-cabecalho.simples {
            min-height: 60px;
            padding: 11px 13px;
          }

          .card-label {
            font-size: 7px;
          }

          .card-cabecalho h2 {
            font-size: 15px;
          }

          .total-pendencias {
            min-width: 27px;
            width: 27px;
            height: 27px;
            font-size: 10px;
          }

          .pendencia {
            grid-template-columns:
              34px minmax(0, 1fr) auto;
            gap: 9px;
            padding: 11px 13px;
          }

          .pendencia-icone {
            width: 34px;
            height: 34px;
            border-radius: 8px;
          }

          .pendencia-info {
            min-width: 0;
          }

          .pendencia-info strong {
            font-size: 10px;
          }

          .pendencia-info span {
            margin-top: 2px;
            font-size: 8px;
            line-height: 1.35;
          }

          .pendencia > b {
            font-size: 12px;
          }

          .pendencia .seta {
            display: none;
          }

          /*
           * Atletas recentes:
           * transforma a tabela em cartões mobile.
           */

          .tabela-cabecalho {
            display: none;
          }

          .linha-atleta {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr) auto;
            grid-template-areas:
              "nome status"
              "modalidade modalidade";
            gap: 6px 10px;
            min-height: 68px;
            padding: 10px 13px;
          }

          .atleta-nome {
            grid-area: nome;
            min-width: 0;
          }

          .atleta-nome strong {
            max-width: 185px;
            font-size: 10px;
          }

          .mini-avatar {
            flex: 0 0 33px;
            width: 33px;
            height: 33px;
          }

          .linha-atleta > span:nth-child(2) {
            grid-area: modalidade;
            display: block;
            padding-left: 42px;
            color: #7c8a9e;
            font-size: 8px;
          }

          .linha-atleta > span:nth-child(3) {
            display: none;
          }

          .linha-atleta > span:nth-child(4) {
            grid-area: status;
            align-self: center;
          }

          .badge {
            white-space: nowrap;
            font-size: 7px;
          }

          .acoes-rapidas a {
            min-height: 55px;
            grid-template-columns:
              36px minmax(0, 1fr) auto;
            padding: 9px 13px;
          }

          .acao-icone {
            width: 36px;
            height: 36px;
          }

          .acoes-rapidas strong {
            font-size: 10px;
          }

          .acoes-rapidas span {
            font-size: 8px;
          }

          .financeiro-linha {
            padding: 11px 13px;
          }

          .financeiro-link {
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        @media (max-width: 390px) {
          .dashboard {
            padding-left: 9px;
            padding-right: 9px;
          }

          .indicadores {
            gap: 6px;
          }

          .indicador {
            padding: 10px;
          }

          .indicador strong {
            font-size: 19px;
          }

          .cabecalho-acoes {
            grid-template-columns: 1fr;
          }

          .atleta-nome strong {
            max-width: 135px;
          }
        }
      `}</style>
    </main>
  );
}