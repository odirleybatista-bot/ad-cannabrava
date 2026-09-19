import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function numero(valor: number | null | undefined) {
  return valor || 0;
}

export default async function RelatoriosEsportivosPage() {
  const supabase = await createClient();

  const { data: atletas } = await supabase
    .from("atletas")
    .select("id,nome,status");

  const { data: partidas } = await supabase
    .from("partidas")
    .select("id,status");

  const { data: eventos } = await supabase
    .from("eventos_partida")
    .select("atleta_id,tipo")
    .eq("tipo", "gol");

  const atletasLista = atletas || [];
  const partidasLista = partidas || [];
  const eventosLista = eventos || [];

  const atletasAtivos =
    atletasLista.filter(
      (atleta) => atleta.status === "ativo"
    ).length;

  const jogosRealizados =
    partidasLista.filter(
      (partida) =>
        partida.status === "finalizada" ||
        partida.status === "finalizado"
    ).length;

  const golsMarcados =
    eventosLista.length;

  const golsPorAtleta =
    new Map<string, number>();

  for (const evento of eventosLista) {
    if (!evento.atleta_id) continue;

    golsPorAtleta.set(
      evento.atleta_id,
      (golsPorAtleta.get(evento.atleta_id) || 0) + 1
    );
  }

  let artilheiroNome = "Sem dados";
  let artilheiroGols = 0;

  if (golsPorAtleta.size > 0) {
    const ordenado =
      Array.from(golsPorAtleta.entries())
        .sort((a, b) => b[1] - a[1])[0];

    if (ordenado) {
      const [atletaId, gols] = ordenado;

      const atleta =
        atletasLista.find(
          (item) => item.id === atletaId
        );

      artilheiroNome =
        atleta?.nome || "Atleta";

      artilheiroGols = gols;
    }
  }

  const relatorios = [
    {
      titulo: "Atletas Ativos",
      descricao:
        "Relação completa dos atletas com vínculo ativo na associação.",
      href:
        "/admin/relatorios/esportivo/atletas-ativos",
      destaque:
        `${atletasAtivos} ativo${atletasAtivos === 1 ? "" : "s"}`,
      icone: "👥",
    },
    {
      titulo: "Ficha Oficial do Atleta",
      descricao:
        "Documento cadastral completo com informações pessoais, esportivas e administrativas.",
      href:
        "/admin/relatorios/esportivo/ficha-atleta",
      destaque:
        `${atletasLista.length} cadastro${atletasLista.length === 1 ? "" : "s"}`,
      icone: "📄",
    },
    {
      titulo: "Ranking de Goleadores",
      descricao:
        "Classificação geral e por competição dos atletas com maior número de gols.",
      href:
        "/admin/relatorios/esportivo/goleadores",
      destaque:
        golsMarcados > 0
          ? `${golsMarcados} gol${golsMarcados === 1 ? "" : "s"}`
          : "Sem gols registrados",
      icone: "⚽",
    },
    {
      titulo: "Participação em Partidas",
      descricao:
        "Acompanhe jogos disputados, titularidades, presença e participação dos atletas.",
      href:
        "/admin/relatorios/esportivo/participacao",
      destaque:
        `${jogosRealizados} jogo${jogosRealizados === 1 ? "" : "s"} realizado${jogosRealizados === 1 ? "" : "s"}`,
      icone: "📊",
    },
    {
      titulo: "Convocações",
      descricao:
        "Histórico de atletas convocados, confirmações e situação por partida.",
      href:
        "/admin/relatorios/esportivo/convocacoes",
      destaque:
        "Controle esportivo",
      icone: "📋",
    },
    {
      titulo: "Resumo da Temporada",
      descricao:
        "Visão consolidada da temporada com atletas, jogos, gols e desempenho geral.",
      href:
        "/admin/relatorios/esportivo/temporada",
      destaque:
        "Visão geral",
      icone: "🏆",
    },
  ];

  return (
    <main className="pagina">
      <section className="cabecalho">
        <div>
          <div className="secao">
            RELATÓRIOS
          </div>

          <h1>
            Relatórios Esportivos
          </h1>

          <p>
            Consulte dados cadastrais,
            esportivos e estatísticos da
            Associação Desportiva Cannabrava.
          </p>
        </div>
      </section>

      <section className="indicadores">
        <div className="indicador">
          <span>
            Atletas ativos
          </span>

          <strong>
            {numero(atletasAtivos)}
          </strong>

          <small>
            vínculos em atividade
          </small>
        </div>

        <div className="indicador">
          <span>
            Jogos realizados
          </span>

          <strong>
            {numero(jogosRealizados)}
          </strong>

          <small>
            partidas encerradas
          </small>
        </div>

        <div className="indicador">
          <span>
            Gols marcados
          </span>

          <strong>
            {numero(golsMarcados)}
          </strong>

          <small>
            registrados em súmulas
          </small>
        </div>

        <div className="indicador artilheiro">
          <span>
            Artilheiro
          </span>

          <strong className="nome-artilheiro">
            {artilheiroNome}
          </strong>

          <small>
            {artilheiroGols > 0
              ? `${artilheiroGols} gol${artilheiroGols === 1 ? "" : "s"}`
              : "sem dados"}
          </small>
        </div>
      </section>

      <section className="titulo-relatorios">
        <div>
          <h2>
            Relatórios disponíveis
          </h2>

          <p>
            Selecione o relatório que deseja consultar.
          </p>
        </div>
      </section>

      <section className="grade-relatorios">
        {relatorios.map(
          (relatorio) => (
            <Link
              key={relatorio.href}
              href={relatorio.href}
              className="card-link"
            >
              <article className="card">
                <div className="card-topo">
                  <div className="icone">
                    {relatorio.icone}
                  </div>

                  <div className="badge">
                    {relatorio.destaque}
                  </div>
                </div>

                <h3>
                  {relatorio.titulo}
                </h3>

                <p>
                  {relatorio.descricao}
                </p>

                <div className="abrir">
                  Abrir relatório
                  <span>→</span>
                </div>
              </article>
            </Link>
          )
        )}
      </section>

      <style>{`
        .pagina {
          max-width: 1700px;
          margin: 0 auto;
          padding: 22px 30px 35px;
        }

        .cabecalho {
          margin-bottom: 16px;
        }

        .secao {
          color: #1763d6;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .cabecalho h1 {
          margin: 3px 0 4px;
          color: #082e69;
          font-size: 31px;
          line-height: 1.05;
        }

        .cabecalho p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .indicador {
          min-height: 95px;
          padding: 14px 17px;
          background: #ffffff;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .indicador span {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .indicador strong {
          margin-top: 2px;
          color: #082e69;
          font-size: 28px;
          line-height: 1.05;
        }

        .indicador small {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 10px;
        }

        .nome-artilheiro {
          font-size: 17px !important;
          line-height: 1.2 !important;
        }

        .titulo-relatorios {
          margin-bottom: 10px;
        }

        .titulo-relatorios h2 {
          margin: 0;
          color: #082e69;
          font-size: 18px;
        }

        .titulo-relatorios p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .grade-relatorios {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .card-link {
          text-decoration: none;
          color: inherit;
        }

        .card {
          height: 100%;
          min-height: 170px;
          padding: 17px;
          background: #ffffff;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          transition: .18s ease;
        }

        .card:hover {
          border-color: #aebfd6;
          box-shadow:
            0 5px 14px
            rgba(15, 23, 42, .06);
          transform: translateY(-1px);
        }

        .card-topo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .icone {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #edf4ff;
          font-size: 19px;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
        }

        .card h3 {
          margin: 0;
          color: #082e69;
          font-size: 16px;
        }

        .card p {
          margin: 6px 0 13px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.45;
        }

        .abrir {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #1763d6;
          font-size: 11px;
          font-weight: 800;
        }

        @media (max-width: 1100px) {
          .indicadores {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .grade-relatorios {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 18px 15px 30px;
          }

          .cabecalho h1 {
            font-size: 25px;
          }

          .indicadores {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .indicador {
            min-height: 84px;
            padding: 12px;
          }

          .indicador strong {
            font-size: 23px;
          }

          .grade-relatorios {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    
      <Link
        href="/admin/relatorios/esportivo/atletas-por-modalidade"
        className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg font-black text-blue-700">
          AM
        </div>

        <h2 className="text-lg font-black text-[#08265a]">
          Atletas por Modalidade
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Relação de atletas agrupados por modalidade, com nome, apelido, RG, título de eleitor e posição.
        </p>

        <span className="mt-5 inline-flex text-sm font-bold text-blue-700">
          Abrir relatório →
        </span>
      </Link>
</main>
  );
}