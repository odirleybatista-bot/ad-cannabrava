import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Atleta = {
  id: string;
  nome: string;
  apelido: string | null;
  posicao: string | null;
  modalidade: string | null;
  status: string | null;
  numero_camisa: string | number | null;
  criado_em: string | null;
};

function statusLabel(status: string | null) {
  const mapa: Record<string, string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados: "Documentos enviados",
    em_analise: "Em análise",
    aprovado: "Aprovado",
    vinculado: "Vinculado",
    termo_liberado: "Termo liberado",
    ativo: "Ativo",
    suspenso: "Suspenso",
    inativo: "Inativo",
  };

  return mapa[status || ""] || status || "Pendente";
}

export default async function AtletasPage({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    status?: string;
    posicao?: string;
  }>;
}) {
  const filtros = await searchParams;

  const busca = filtros.busca?.trim() || "";
  const status = filtros.status || "";
  const posicao = filtros.posicao || "";

  const supabase = await createClient();

  let query = supabase
    .from("atletas")
    .select(`
      id,
      nome,
      apelido,
      posicao,
      modalidade,
      status,
      numero_camisa,
      criado_em
    `)
    .order("nome", {
      ascending: true,
    });

  if (busca) {
    query = query.or(
      `nome.ilike.%${busca}%,apelido.ilike.%${busca}%`
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (posicao) {
    query = query.eq("posicao", posicao);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao carregar atletas:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  const atletas = (data || []) as Atleta[];

  const { data: todos } = await supabase
    .from("atletas")
    .select("id,status");

  const lista = todos || [];

  const total = lista.length;

  const ativos = lista.filter(
    (item) => item.status === "ativo"
  ).length;

  const emAnalise = lista.filter(
    (item) =>
      item.status === "em_analise" ||
      item.status === "documentos_enviados"
  ).length;

  const aguardandoVinculo = lista.filter(
    (item) =>
      item.status === "aprovado"
  ).length;

  const { count: documentosPendentes } =
    await supabase
      .from("atleta_documentos")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("status", [
        "enviado",
        "em_analise",
        "correcao_solicitada",
      ]);

  return (
    <main className="pagina">
      <section className="topo">
        <div>
          <span className="secao">
            GESTÃO ESPORTIVA
          </span>

          <h1>Atletas</h1>

          <p>
            Acompanhe cadastros, documentos,
            vínculos e situação esportiva.
          </p>
        </div>

        <Link
          href="/admin/esportivo/atletas/novo"
          className="novo"
        >
          + Novo atleta
        </Link>
      </section>

      <section className="indicadores">
        <div className="indicador">
          <span>TOTAL</span>
          <strong>{total}</strong>
          <small>cadastrados</small>
        </div>

        <div className="indicador ativo-card">
          <span>ATIVOS</span>
          <strong>{ativos}</strong>
          <small>em atividade</small>
        </div>

        <div className="indicador">
          <span>EM ANÁLISE</span>
          <strong>{emAnalise}</strong>
          <small>cadastros pendentes</small>
        </div>

        <div className="indicador">
          <span>AGUARDANDO VÍNCULO</span>
          <strong>{aguardandoVinculo}</strong>
          <small>já aprovados</small>
        </div>

        <div className="indicador alerta-card">
          <span>DOCUMENTOS</span>
          <strong>{documentosPendentes || 0}</strong>
          <small>requerem atenção</small>
        </div>
      </section>

      <section className="painel">
        <div className="painel-topo">
          <div>
            <span className="label">
              CADASTROS
            </span>

            <h2>Lista de atletas</h2>
          </div>

          <div className="contador">
            {atletas.length}
          </div>
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
              placeholder="Nome ou apelido"
            />
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
              <option value="">Todas</option>
              <option value="pre_cadastro">
                Pré-cadastro
              </option>
              <option value="documentos_enviados">
                Documentos enviados
              </option>
              <option value="em_analise">
                Em análise
              </option>
              <option value="aprovado">
                Aprovado
              </option>
              <option value="vinculado">
                Vinculado
              </option>
              <option value="ativo">
                Ativo
              </option>
              <option value="suspenso">
                Suspenso
              </option>
              <option value="inativo">
                Inativo
              </option>
            </select>
          </div>

          <div className="campo">
            <label htmlFor="posicao">
              Posição
            </label>

            <select
              id="posicao"
              name="posicao"
              defaultValue={posicao}
            >
              <option value="">Todas</option>
              <option value="Goleiro">Goleiro</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Lateral Direito">
                Lateral Direito
              </option>
              <option value="Lateral Esquerdo">
                Lateral Esquerdo
              </option>
              <option value="Volante">Volante</option>
              <option value="Meia">Meia</option>
              <option value="Atacante">Atacante</option>
            </select>
          </div>

          <div className="acoes-filtro">
            <button type="submit">
              Filtrar
            </button>

            <Link href="/admin/esportivo/atletas">
              Limpar
            </Link>
          </div>
        </form>

        {atletas.length === 0 ? (
          <div className="vazio">
            <div className="vazio-icone">
              AT
            </div>

            <h3>Nenhum atleta encontrado</h3>

            <p>
              Cadastre um novo atleta ou altere os filtros.
            </p>
          </div>
        ) : (
          <>
            <div className="desktop-lista">
              <div className="linha cabecalho-tabela">
                <span>ATLETA</span>
                <span>POSIÇÃO</span>
                <span>CAMISA</span>
                <span>MODALIDADE</span>
                <span>SITUAÇÃO</span>
                <span />
              </div>

              {atletas.map((atleta) => (
                <Link
                  key={atleta.id}
                  href={`/admin/esportivo/atletas/${atleta.id}`}
                  className="linha linha-atleta"
                >
                  <div className="atleta">
                    <div className="avatar">
                      {atleta.nome
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((parte: string) => parte[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="dados-atleta">
                      <strong>
                        {atleta.nome}
                      </strong>

                      <small>
                        {atleta.apelido || "Sem apelido"}
                      </small>
                    </div>
                  </div>

                  <span>
                    {atleta.posicao || "—"}
                  </span>

                  <span className="camisa">
                    {atleta.numero_camisa || "—"}
                  </span>

                  <span>
                    {atleta.modalidade || "Futebol"}
                  </span>

                  <span
                    className={`status status-${atleta.status}`}
                  >
                    {statusLabel(atleta.status)}
                  </span>

                  <span className="seta">
                    ›
                  </span>
                </Link>
              ))}
            </div>

            <div className="mobile-lista">
              {atletas.map((atleta) => (
                <Link
                  key={atleta.id}
                  href={`/admin/esportivo/atletas/${atleta.id}`}
                  className="mobile-card"
                >
                  <div className="mobile-topo">
                    <div className="atleta">
                      <div className="avatar">
                        {atleta.nome
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((parte: string) => parte[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div className="dados-atleta">
                        <strong>
                          {atleta.nome}
                        </strong>

                        <small>
                          {atleta.apelido || "Atleta"}
                        </small>
                      </div>
                    </div>

                    <span
                      className={`status status-${atleta.status}`}
                    >
                      {statusLabel(atleta.status)}
                    </span>
                  </div>

                  <div className="mobile-info">
                    <div>
                      <span>POSIÇÃO</span>
                      <strong>
                        {atleta.posicao || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>CAMISA</span>
                      <strong>
                        {atleta.numero_camisa || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>MODALIDADE</span>
                      <strong>
                        {atleta.modalidade || "Futebol"}
                      </strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1900px;
          margin: 0 auto;
          padding: 22px 26px 38px;
        }

        .topo {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 16px;
        }

        .secao {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .topo h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: 28px;
        }

        .topo p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
        }

        .novo {
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 15px;
          border-radius: 9px;
          background: #082e69;
          color: white;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 9px;
          margin-bottom: 11px;
        }

        .indicador {
          min-height: 88px;
          padding: 12px 14px;
          border: 1px solid #dce5f0;
          border-radius: 11px;
          background: #ffffff;
        }

        .indicador span {
          display: block;
          color: #64748b;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .indicador strong {
          display: block;
          margin-top: 7px;
          color: #082e69;
          font-size: 21px;
        }

        .indicador small {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 8px;
        }

        .ativo-card {
          border-left: 3px solid #168447;
        }

        .alerta-card {
          border-left: 3px solid #d97706;
        }

        .painel {
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: white;
        }

        .painel-topo {
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 15px;
          border-bottom: 1px solid #edf1f5;
        }

        .label {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .painel-topo h2 {
          margin: 2px 0 0;
          color: #082e69;
          font-size: 15px;
        }

        .contador {
          min-width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eef5ff;
          color: #1763d6;
          font-size: 9px;
          font-weight: 900;
        }

        .filtros {
          display: grid;
          grid-template-columns:
            minmax(240px, 1fr)
            180px
            180px
            auto;
          gap: 8px;
          align-items: end;
          padding: 11px 15px;
          background: #f8fafc;
          border-bottom: 1px solid #edf1f5;
        }

        .campo label {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 7px;
          font-weight: 900;
        }

        .campo input,
        .campo select {
          width: 100%;
          height: 36px;
          padding: 0 9px;
          border: 1px solid #d6e0eb;
          border-radius: 8px;
          background: white;
          color: #334155;
          font-size: 9px;
          outline: 0;
        }

        .acoes-filtro {
          display: flex;
          gap: 6px;
        }

        .acoes-filtro button,
        .acoes-filtro a {
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 11px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: 900;
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
            minmax(280px, 1.7fr)
            minmax(110px, .8fr)
            70px
            minmax(110px, .8fr)
            135px
            20px;
          gap: 10px;
          align-items: center;
        }

        .cabecalho-tabela {
          min-height: 32px;
          padding: 0 15px;
          background: #fbfcfd;
          color: #8795a8;
          font-size: 6.5px;
          font-weight: 900;
          letter-spacing: .04em;
        }

        .linha-atleta {
          min-height: 58px;
          padding: 8px 15px;
          border-top: 1px solid #edf1f5;
          color: #536178;
          font-size: 9px;
          text-decoration: none;
        }

        .linha-atleta:hover {
          background: #fbfcfe;
        }

        .atleta {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .avatar {
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eaf2ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .dados-atleta {
          min-width: 0;
        }

        .dados-atleta strong {
          display: block;
          overflow: hidden;
          color: #082e69;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dados-atleta small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 7px;
        }

        .camisa {
          color: #082e69;
          font-weight: 900;
        }

        .status {
          width: fit-content;
          padding: 5px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 7px;
          font-weight: 900;
          white-space: nowrap;
        }

        .status-ativo {
          background: #e7f7ee;
          color: #168447;
        }

        .status-aprovado,
        .status-vinculado {
          background: #eaf2ff;
          color: #1763d6;
        }

        .status-em_analise,
        .status-documentos_enviados {
          background: #fff5e8;
          color: #b96900;
        }

        .status-suspenso {
          background: #fff1e8;
          color: #c05b00;
        }

        .status-inativo {
          background: #f1f5f9;
          color: #64748b;
        }

        .seta {
          color: #94a3b8;
          font-size: 17px;
        }

        .mobile-lista {
          display: none;
        }

        .vazio {
          padding: 50px 20px;
          text-align: center;
        }

        .vazio-icone {
          width: 45px;
          height: 45px;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 9px;
          font-weight: 900;
        }

        .vazio h3 {
          margin: 0;
          color: #082e69;
          font-size: 13px;
        }

        .vazio p {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 8px;
        }

        @media (max-width: 1050px) {
          .indicadores {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 850px) {
          .desktop-lista {
            display: none;
          }

          .mobile-lista {
            display: block;
          }

          .filtros {
            grid-template-columns: 1fr 1fr;
          }

          .mobile-card {
            display: block;
            padding: 12px 13px;
            border-bottom: 1px solid #edf1f5;
            color: inherit;
            text-decoration: none;
          }

          .mobile-card:last-child {
            border-bottom: 0;
          }

          .mobile-topo {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 9px;
          }

          .mobile-topo .atleta {
            flex: 1;
          }

          .mobile-info {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 8px;
            margin-top: 10px;
            padding-top: 9px;
            border-top: 1px solid #edf1f5;
          }

          .mobile-info span {
            display: block;
            color: #94a3b8;
            font-size: 6px;
            font-weight: 900;
          }

          .mobile-info strong {
            display: block;
            margin-top: 2px;
            color: #334155;
            font-size: 8px;
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 15px 10px 28px;
          }

          .topo {
            display: block;
          }

          .topo h1 {
            font-size: 24px;
          }

          .topo p {
            font-size: 9px;
            line-height: 1.4;
          }

          .novo {
            width: 100%;
            min-height: 43px;
            margin-top: 11px;
          }

          .indicadores {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 7px;
          }

          .indicador {
            min-height: 82px;
            padding: 10px;
          }

          .indicador strong {
            margin-top: 6px;
            font-size: 19px;
          }

          .filtros {
            grid-template-columns: 1fr;
            padding: 10px 11px;
          }

          .campo input,
          .campo select {
            height: 42px;
            font-size: 10px;
          }

          .acoes-filtro {
            width: 100%;
          }

          .acoes-filtro button,
          .acoes-filtro a {
            flex: 1;
            min-height: 42px;
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