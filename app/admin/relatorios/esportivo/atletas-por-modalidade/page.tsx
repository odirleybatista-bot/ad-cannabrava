import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BotaoImprimir from "./BotaoImprimir";

type Props = {
  searchParams: Promise<{
    modalidade?: string;
  }>;
};

type Atleta = {
  id: string;
  nome: string | null;
  apelido: string | null;
  rg: string | null;
  modalidade: string | null;
  posicao: string | null;
  titulo_eleitor?: string | null;
  titulo_de_eleitor?: string | null;
  numero_titulo?: string | null;
  titulo?: string | null;
};

export default async function AtletasPorModalidadePage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const modalidadeSelecionada =
    String(params.modalidade || "").trim();

  const supabase = await createClient();

  const { data, error } =
    await supabase
      .from("atletas")
      .select("*")
      .order("modalidade", {
        ascending: true,
      })
      .order("nome", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      error.message ||
        "Não foi possível carregar os atletas."
    );
  }

  const todosAtletas =
    (data || []) as Atleta[];

  const atletas =
    todosAtletas.filter(
      (atleta) =>
        !modalidadeSelecionada ||
        String(atleta.modalidade || "")
          .toLowerCase() ===
          modalidadeSelecionada.toLowerCase()
    );

  const modalidades =
    Array.from(
      new Set(
        todosAtletas
          .map((atleta) =>
            String(
              atleta.modalidade || ""
            ).trim()
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

  const grupos =
    atletas.reduce<
      Record<string, Atleta[]>
    >((acc, atleta) => {
      const modalidade =
        atleta.modalidade?.trim() ||
        "Não informada";

      if (!acc[modalidade]) {
        acc[modalidade] = [];
      }

      acc[modalidade].push(atleta);

      return acc;
    }, {});

  const modalidadesRelatorio =
    Object.keys(grupos).sort(
      (a, b) =>
        a.localeCompare(b, "pt-BR")
    );

  return (
    <main className="relatorio">
      <div className="nao-imprimir topo-acoes">
        <div>
          <Link
            href="/admin/relatorios/esportivo"
            className="voltar"
          >
            ← Voltar para relatórios esportivos
          </Link>

          <h1>
            Atletas por Modalidade
          </h1>

          <p>
            Relação cadastral agrupada por modalidade.
          </p>
        </div>

        <BotaoImprimir />
      </div>

      <section className="nao-imprimir filtros">
        <form method="get">
          <div>
            <label htmlFor="modalidade">
              Modalidade
            </label>

            <select
              id="modalidade"
              name="modalidade"
              defaultValue={
                modalidadeSelecionada
              }
            >
              <option value="">
                Todas as modalidades
              </option>

              {modalidades.map(
                (modalidade) => (
                  <option
                    key={modalidade}
                    value={modalidade}
                  >
                    {modalidade}
                  </option>
                )
              )}
            </select>
          </div>

          <button type="submit">
            Filtrar
          </button>

          {modalidadeSelecionada && (
            <Link
              href="/admin/relatorios/esportivo/atletas-por-modalidade"
              className="limpar"
            >
              Limpar
            </Link>
          )}
        </form>
      </section>

      <header className="cabecalho">
        <div>
          <span>
            A.D. CANNABRAVA
          </span>

          <h2>
            RELAÇÃO DE ATLETAS POR MODALIDADE
          </h2>

          <p>
            Associação Desportiva Cannabrava
          </p>
        </div>

        <small>
          Emitido em{" "}
          {new Intl.DateTimeFormat(
            "pt-BR"
          ).format(new Date())}
        </small>
      </header>

      <div className="resumo">
        <div>
          <span>MODALIDADE</span>

          <strong>
            {modalidadeSelecionada ||
              "Todas"}
          </strong>
        </div>

        <div>
          <span>TOTAL DE ATLETAS</span>

          <strong>
            {atletas.length}
          </strong>
        </div>

        <div>
          <span>TOTAL DE MODALIDADES</span>

          <strong>
            {
              modalidadesRelatorio.length
            }
          </strong>
        </div>
      </div>

      {modalidadesRelatorio.length ===
      0 ? (
        <div className="vazio">
          Nenhum atleta encontrado.
        </div>
      ) : (
        modalidadesRelatorio.map(
          (modalidade) => (
            <section
              key={modalidade}
              className="grupo"
            >
              <div className="grupo-topo">
                <div>
                  <span>
                    MODALIDADE
                  </span>

                  <h3>
                    {modalidade}
                  </h3>
                </div>

                <strong>
                  {
                    grupos[modalidade]
                      .length
                  }{" "}
                  atleta
                  {grupos[modalidade]
                    .length !== 1
                    ? "s"
                    : ""}
                </strong>
              </div>

              <div className="tabela-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nome completo</th>
                      <th>Apelido</th>
                      <th>RG</th>
                      <th>Título de eleitor</th>
                      <th>Posição</th>
                    </tr>
                  </thead>

                  <tbody>
                    {grupos[
                      modalidade
                    ].map(
                      (
                        atleta,
                        index
                      ) => (
                        <tr
                          key={
                            atleta.id
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td className="nome">
                            {atleta.nome ||
                              "Não informado"}
                          </td>

                          <td>
                            {atleta.apelido ||
                              "—"}
                          </td>

                          <td>
                            {atleta.rg ||
                              "—"}
                          </td>

                          <td>
                            {obterTituloEleitor(
                              atleta
                            )}
                          </td>

                          <td>
                            {atleta.posicao ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )
        )
      )}

      <style>{`
        .relatorio {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 22px 24px 40px;
        }

        .topo-acoes {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .voltar {
          color: #1763d6;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
        }

        .topo-acoes h1 {
          margin: 8px 0 3px;
          color: #082e69;
          font-size: 27px;
        }

        .topo-acoes p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .filtros {
          margin-bottom: 18px;
          padding: 14px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .filtros form {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filtros label {
          display: block;
          margin-bottom: 5px;
          color: #475569;
          font-size: 10px;
          font-weight: 800;
        }

        .filtros select {
          min-width: 260px;
          height: 40px;
          padding: 0 10px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: white;
        }

        .filtros button,
        .limpar {
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .filtros button {
          border: 0;
          background: #082e69;
          color: white;
          cursor: pointer;
        }

        .limpar {
          border: 1px solid #d7e0ea;
          background: white;
          color: #475569;
        }

        .cabecalho {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 18px 20px;
          border-radius: 12px;
          background: #082e69;
          color: white;
        }

        .cabecalho span {
          color: #79d29b;
          font-size: 10px;
          font-weight: 900;
        }

        .cabecalho h2 {
          margin: 4px 0 2px;
          font-size: 19px;
        }

        .cabecalho p {
          margin: 0;
          font-size: 10px;
          opacity: .75;
        }

        .cabecalho small {
          font-size: 9px;
          opacity: .8;
        }

        .resumo {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 8px;
          margin: 10px 0;
        }

        .resumo > div {
          padding: 11px 13px;
          border: 1px solid #dce5f0;
          border-radius: 9px;
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
          margin-top: 3px;
          color: #082e69;
          font-size: 13px;
        }

        .grupo {
          margin-top: 14px;
        }

        .grupo-topo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 9px 12px;
          border-left: 4px solid #168447;
          background: #f4f8fc;
        }

        .grupo-topo span {
          display: block;
          color: #168447;
          font-size: 6px;
          font-weight: 900;
        }

        .grupo-topo h3 {
          margin: 1px 0 0;
          color: #082e69;
          font-size: 14px;
        }

        .grupo-topo > strong {
          color: #64748b;
          font-size: 8px;
        }

        .tabela-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        th {
          padding: 9px 8px;
          border-bottom: 2px solid #dce5f0;
          color: #475569;
          font-size: 7px;
          text-align: left;
          text-transform: uppercase;
        }

        td {
          padding: 8px;
          border-bottom: 1px solid #edf1f5;
          color: #475569;
          font-size: 8px;
        }

        td.nome {
          color: #1e293b;
          font-weight: 800;
        }

        .vazio {
          margin-top: 14px;
          padding: 40px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          color: #64748b;
          text-align: center;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          .nao-imprimir {
            display: none !important;
          }

          body {
            background: #fff !important;
          }

          .relatorio {
            max-width: none;
            padding: 0;
          }

          .cabecalho {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          thead {
            display: table-header-group;
          }

          tr {
            break-inside: avoid;
          }
        }

        @media(max-width:700px) {
          .topo-acoes {
            align-items: stretch;
            flex-direction: column;
          }

          .resumo {
            grid-template-columns: 1fr;
          }

          .filtros select {
            min-width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function obterTituloEleitor(
  atleta: Atleta
) {
  return (
    atleta.titulo_eleitor ||
    atleta.titulo_de_eleitor ||
    atleta.numero_titulo ||
    atleta.titulo ||
    "—"
  );
}