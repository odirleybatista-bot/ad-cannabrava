import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CompeticaoDetalhePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: competicao } = await supabase
    .from("competicoes")
    .select(`
      id,
      nome,
      temporada,
      tipo,
      formato,
      descricao,
      data_inicio,
      data_fim,
      local_principal,
      organizador,
      status
    `)
    .eq("id", id)
    .maybeSingle();

  if (!competicao) {
    notFound();
  }

  return (
    <main className="pagina">
      <div className="topo">
        <div>
          <span>GESTÃO ESPORTIVA</span>
          <h1>{competicao.nome}</h1>

          <p>
            {competicao.temporada || "Sem temporada"}
            {" • "}
            {competicao.tipo || "Competição"}
          </p>
        </div>

        <Link href="/admin/esportivo/competicoes">
          ← Competições
        </Link>
      </div>

      <nav className="abas">
        <span className="ativa">
          Resumo
        </span>

        <span>Equipes</span>
        <span>Partidas</span>
        <span>Classificação</span>
        <span>Artilharia</span>
        <span>Documentos</span>
      </nav>

      <section className="conteudo">
        <div className="card principal">
          <span className="label">
            COMPETIÇÃO
          </span>

          <h2>Resumo</h2>

          <div className="grade">
            <div>
              <span>Temporada</span>
              <strong>
                {competicao.temporada || "—"}
              </strong>
            </div>

            <div>
              <span>Formato</span>
              <strong>
                {competicao.formato || "—"}
              </strong>
            </div>

            <div>
              <span>Organizador</span>
              <strong>
                {competicao.organizador || "—"}
              </strong>
            </div>

            <div>
              <span>Local principal</span>
              <strong>
                {competicao.local_principal || "—"}
              </strong>
            </div>
          </div>

          {competicao.descricao && (
            <p className="descricao">
              {competicao.descricao}
            </p>
          )}
        </div>

        <aside className="card">
          <span className="label">
            SITUAÇÃO
          </span>

          <h2>Status</h2>

          <div className="status">
            {competicao.status}
          </div>

          <p>
            A estrutura completa da competição será
            configurada nas próximas etapas.
          </p>
        </aside>
      </section>

      <style>{`
        .pagina {
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px 28px 40px;
        }

        .topo {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }

        .topo > div > span,
        .label {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: 28px;
        }

        .topo p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
        }

        .topo a {
          color: #082e69;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .abas {
          display: flex;
          gap: 3px;
          margin: 18px 0 12px;
          overflow-x: auto;
          border-bottom: 1px solid #dce5f0;
        }

        .abas span {
          flex: 0 0 auto;
          padding: 10px 13px;
          color: #64748b;
          font-size: 9px;
          font-weight: 800;
        }

        .abas .ativa {
          color: #1763d6;
          border-bottom: 2px solid #1763d6;
        }

        .conteudo {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 300px;
          gap: 12px;
        }

        .card {
          padding: 17px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: white;
        }

        .card h2 {
          margin: 3px 0 16px;
          color: #082e69;
          font-size: 16px;
        }

        .grade {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 10px;
        }

        .grade div {
          padding: 12px;
          border-radius: 9px;
          background: #f8fafc;
        }

        .grade span {
          display: block;
          color: #94a3b8;
          font-size: 7px;
          font-weight: 900;
        }

        .grade strong {
          display: block;
          margin-top: 3px;
          color: #334155;
          font-size: 10px;
        }

        .descricao {
          margin: 14px 0 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .status {
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 9px;
          font-weight: 800;
        }

        aside p {
          margin: 14px 0 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.45;
        }

        @media (max-width: 800px) {
          .conteudo {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 16px 11px 28px;
          }

          .topo {
            display: block;
          }

          .topo a {
            display: inline-block;
            margin-top: 12px;
          }

          h1 {
            font-size: 24px;
          }

          .grade {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}