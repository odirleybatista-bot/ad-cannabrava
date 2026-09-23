import { createClient } from "@/lib/supabase/server";
import BotaoImprimirRelatorio from "./BotaoImprimirRelatorio";

const TIPOS = [
  {
    tipo: "identidade",
    label: "Documento de Identidade",
  },
  {
    tipo: "residencia",
    label: "Comprovante de Residência",
  },
  {
    tipo: "eleitoral",
    label: "Regularidade Eleitoral",
  },
];

function statusDocumento(
  documentos: any[],
  tipo: string
) {
  const documento =
    documentos?.find(
      (item) =>
        item.tipo === tipo
    );

  if (!documento) {
    return "Não enviado";
  }

  const mapa: Record<string, string> = {
    pendente: "Pendente",
    enviado: "Enviado",
    em_analise: "Em análise",
    aprovado: "Aprovado",
    correcao_solicitada:
      "Correção solicitada",
    rejeitado: "Rejeitado",
  };

  return (
    mapa[documento.status] ||
    documento.status ||
    "Pendente"
  );
}

export default async function ImprimirPage({
  searchParams,
}: {
  searchParams: Promise<{
    ids?: string;
  }>;
}) {
  const params =
    await searchParams;

  const ids =
    params.ids
      ?.split(",")
      .filter(Boolean) || [];

  const supabase =
    await createClient();

  const { data } =
    ids.length > 0
      ? await supabase
          .from("atletas")
          .select(`
            id,
            nome,
            apelido,
            cpf,
            rg,
            modalidade,
            posicao,
            atleta_documentos (
              tipo,
              status,
              nome_arquivo
            )
          `)
          .in("id", ids)
          .order("nome")
      : { data: [] };

  const atletas =
    data || [];

  return (
    <main className="pagina">
      <section className="acoes">
        <div>
          <span>
            RELATÓRIO
          </span>

          <h1>
            Documentação Completa
          </h1>

          <p>
            {atletas.length} atleta(s)
            selecionado(s).
          </p>
        </div>

        <BotaoImprimirRelatorio />
      </section>

      <section className="relatorio">
        <header className="cabecalho">
          <img
            src="/branding/escudo.png"
            alt="A.D. Cannabrava"
          />

          <div>
            <strong>
              ASSOCIAÇÃO DESPORTIVA CANNABRAVA
            </strong>

            <h2>
              DOCUMENTAÇÃO COMPLETA
            </h2>

            <span>
              Gestão Esportiva
            </span>
          </div>
        </header>

        {atletas.map(
          (
            atleta,
            indice
          ) => (
            <article
              key={atleta.id}
              className="ficha"
            >
              <div className="titulo-atleta">
                <span>
                  {indice + 1}
                </span>

                <div>
                  <h3>
                    {atleta.nome}
                  </h3>

                  <small>
                    {atleta.apelido ||
                      "Atleta"}
                  </small>
                </div>
              </div>

              <div className="dados">
                <div>
                  <span>CPF</span>
                  <strong>
                    {atleta.cpf ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>RG</span>
                  <strong>
                    {atleta.rg ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    MODALIDADE
                  </span>
                  <strong>
                    {atleta.modalidade ||
                      "Futebol"}
                  </strong>
                </div>

                <div>
                  <span>
                    POSIÇÃO
                  </span>
                  <strong>
                    {atleta.posicao ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="documentos">
                {TIPOS.map(
                  (item) => (
                    <div
                      key={
                        item.tipo
                      }
                      className="documento"
                    >
                      <span>
                        {item.label}
                      </span>

                      <strong>
                        {statusDocumento(
                          atleta.atleta_documentos ||
                            [],
                          item.tipo
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </article>
          )
        )}

        <footer>
          Associação Desportiva Cannabrava —
          Sistema Oficial de Gestão
        </footer>
      </section>

      <style>{`
        .pagina {
          max-width: 1100px;
          margin: 0 auto;
          padding: 22px;
        }

        .acoes {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
        }

        .acoes span {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
        }

        .acoes h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: 27px;
        }

        .acoes p {
          margin: 0;
          color: #64748b;
          font-size: 9px;
        }

        .relatorio {
          border: 1px solid #dce5f0;
          background: white;
        }

        .cabecalho {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          border-bottom: 4px solid #168447;
          background: #082e69;
          color: white;
        }

        .cabecalho img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }

        .cabecalho strong {
          display: block;
          font-size: 8px;
        }

        .cabecalho h2 {
          margin: 3px 0;
          font-size: 17px;
        }

        .cabecalho span {
          font-size: 8px;
          opacity: .75;
        }

        .ficha {
          padding: 18px 20px;
          border-bottom: 1px solid #dce5f0;
          page-break-inside: avoid;
        }

        .titulo-atleta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .titulo-atleta > span {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eef5ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .titulo-atleta h3 {
          margin: 0;
          color: #082e69;
          font-size: 13px;
        }

        .titulo-atleta small {
          color: #94a3b8;
          font-size: 7px;
        }

        .dados {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 9px;
        }

        .documentos {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 8px;
        }

        .dados div,
        .documento {
          padding: 9px 10px;
          border: 1px solid #edf1f5;
          border-radius: 7px;
          background: #fbfcfd;
        }

        .dados span,
        .documento span {
          display: block;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
        }

        .dados strong,
        .documento strong {
          display: block;
          margin-top: 3px;
          color: #334155;
          font-size: 8px;
        }

        footer {
          padding: 12px;
          text-align: center;
          color: #94a3b8;
          font-size: 7px;
        }

        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            background: white !important;
          }

          .acoes {
            display: none !important;
          }

          .pagina {
            max-width: none;
            padding: 0;
            margin: 0;
          }

          .relatorio {
            border: 0;
          }

          .cabecalho {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .ficha {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}