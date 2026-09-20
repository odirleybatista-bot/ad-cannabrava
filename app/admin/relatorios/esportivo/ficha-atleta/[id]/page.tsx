import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotaoImprimir from "../../BotaoImprimir";

function formatarData(data: string | null | undefined) {
  if (!data) return "Não informado";

  const [ano, mes, dia] = data
    .substring(0, 10)
    .split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function textoStatus(
  status: string | null | undefined
) {
  const mapa: Record<string, string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados: "Documentos enviados",
    em_analise: "Em análise",
    correcao_solicitada: "Correção solicitada",
    aprovado: "Aprovado",
    vinculado: "Vinculado",
    termo_liberado: "Termo liberado",
    ativo: "Ativo",
    enviado: "Enviado",
    aguardando_assinatura: "Aguardando assinatura",
    assinado: "Assinado",
    gerado: "Gerado",
  };

  return (
    mapa[status || ""] ||
    status ||
    "Não informado"
  );
}

function Campo({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div className="campo">
      <span>{titulo}</span>

      <strong
        className={
          destaque
            ? "valor destaque"
            : "valor"
        }
      >
        {valor || "Não informado"}
      </strong>
    </div>
  );
}

export default async function FichaIndividualPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: atleta,
    error: atletaError,
  } = await supabase
    .from("atletas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (
    atletaError ||
    !atleta
  ) {
    notFound();
  }

  const {
    data: documentos,
  } = await supabase
    .from("atleta_documentos")
    .select(`
      id,
      tipo,
      status,
      caminho_arquivo
    `)
    .eq(
      "atleta_id",
      id
    );

  const fotoDocumento =
    (documentos || []).find(
      (documento: any) =>
        documento.tipo === "foto_3x4"
    ) || null;

  let fotoUrl: string | null = null;

  if (
    fotoDocumento?.caminho_arquivo
  ) {
    const {
      data: fotoAssinada,
    } = await supabase.storage
      .from("atleta-documentos")
      .createSignedUrl(
        fotoDocumento.caminho_arquivo,
        3600
      );

    fotoUrl =
      fotoAssinada?.signedUrl ||
      null;
  }

  const {
    data: vinculo,
  } = await supabase
    .from("atleta_vinculos")
    .select("*")
    .eq(
      "atleta_id",
      id
    )
    .order(
      "criado_em",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  const {
    data: termo,
  } = await supabase
    .from("termos_compromisso")
    .select(`
      id,
      status,
      assinado_em,
      aceite
    `)
    .eq(
      "atleta_id",
      id
    )
    .order(
      "criado_em",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  const hoje =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(
      new Date()
    );

  const codigoFicha =
    `FA-${atleta.id
      .replaceAll("-", "")
      .substring(0, 8)
      .toUpperCase()}`;

  const tiposObrigatorios = [
    "identidade",
    "residencia",
    "eleitoral",
  ];

  const docsObrigatorios =
    (documentos || []).filter(
      (doc) =>
        tiposObrigatorios.includes(
          doc.tipo
        )
    );

  const documentosAprovados =
    docsObrigatorios.filter(
      (doc) =>
        doc.status === "aprovado"
    ).length;

  const documentacaoCompleta =
    documentosAprovados ===
    tiposObrigatorios.length;

  const situacaoDocumental =
    documentacaoCompleta
      ? "Completa"
      : `${documentosAprovados}/${tiposObrigatorios.length} aprovados`;

  const situacaoVinculo =
    vinculo
      ? textoStatus(
          vinculo.status
        )
      : "Sem vínculo";

  const situacaoTermo =
    termo
      ? textoStatus(
          termo.status
        )
      : "Não gerado";

  const cidadeUf =
    [
      atleta.cidade,
      atleta.uf,
    ]
      .filter(Boolean)
      .join(" / ") ||
    "Não informado";

  const emergenciaNome =
    atleta.emergencia_nome ||
    atleta.contato_emergencia;

  const emergenciaTelefone =
    atleta.emergencia_telefone ||
    atleta.telefone_emergencia;

  return (
    <main className="pagina">

      <div className="barra-acoes nao-imprimir">

        <div>
          <Link
            href="/admin/relatorios/esportivo/ficha-atleta"
            className="voltar"
          >
            ← Selecionar outro atleta
          </Link>

          <h1>
            Ficha resumida do atleta
          </h1>

          <p>
            Versão otimizada para
            impressão em uma folha A4.
          </p>
        </div>

        <BotaoImprimir />

      </div>


      <section className="ficha">

        <header className="cabecalho">

          <div className="identidade-clube">

            <img
              src="/escudo.png"
              alt="A.D. Cannabrava"
              className="escudo"
            />

            <div>
              <span className="associacao">
                ASSOCIAÇÃO DESPORTIVA
                CANNABRAVA
              </span>

              <h2>
                FICHA RESUMIDA DO ATLETA
              </h2>

              <small>
                Força, Foco e União
              </small>
            </div>

          </div>


          <div className="dados-documento">

            <strong>
              {codigoFicha}
            </strong>

            <span>
              Emissão: {hoje}
            </span>

          </div>

        </header>


        <section className="identificacao">

          <div className="foto">

            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={atleta.nome}
              />
            ) : (
              <div className="sem-foto">
                FOTO
              </div>
            )}

          </div>


          <div className="dados-principais">

            <div className="nome-status">

              <div>
                <span className="rotulo">
                  ATLETA
                </span>

                <h3>
                  {atleta.nome}
                </h3>

                {atleta.apelido && (
                  <small>
                    Apelido: {
                      atleta.apelido
                    }
                  </small>
                )}
              </div>


              <div className="status-atleta">
                {textoStatus(
                  atleta.status
                )}
              </div>

            </div>


            <div className="grade grade-3">

              <Campo
                titulo="CPF"
                valor={atleta.cpf}
              />

              <Campo
                titulo="RG"
                valor={atleta.rg}
              />

              <Campo
                titulo="Nascimento"
                valor={formatarData(
                  atleta.data_nascimento
                )}
              />

              <Campo
                titulo="Telefone"
                valor={
                  atleta.telefone
                }
              />

              <Campo
                titulo="E-mail"
                valor={
                  atleta.email
                }
              />

              <Campo
                titulo="Cidade / UF"
                valor={
                  cidadeUf
                }
              />

            </div>

          </div>

        </section>


        <section className="secao">

          <div className="titulo-secao">
            DADOS ESPORTIVOS
          </div>

          <div className="grade grade-4">

            <Campo
              titulo="Modalidade"
              valor={
                atleta.modalidade
              }
            />

            <Campo
              titulo="Posição"
              valor={
                atleta.posicao
              }
            />

            <Campo
              titulo="Camisa"
              valor={
                atleta.numero_camisa
              }
            />

            <Campo
              titulo="Pé preferencial"
              valor={
                atleta.pe_preferencial
              }
            />

          </div>

        </section>


        <section className="secao">

          <div className="titulo-secao">
            CONTATO DE EMERGÊNCIA
          </div>

          <div className="grade grade-3">

            <Campo
              titulo="Nome"
              valor={
                emergenciaNome
              }
            />

            <Campo
              titulo="Parentesco"
              valor={
                atleta.emergencia_parentesco
              }
            />

            <Campo
              titulo="Telefone"
              valor={
                emergenciaTelefone
              }
            />

          </div>

        </section>


        <section className="secao">

          <div className="titulo-secao">
            SITUAÇÃO CADASTRAL
          </div>

          <div className="situacao-grid">

            <div className="situacao-card">
              <span>
                DOCUMENTAÇÃO
              </span>

              <strong
                className={
                  documentacaoCompleta
                    ? "ok"
                    : ""
                }
              >
                {
                  situacaoDocumental
                }
              </strong>
            </div>


            <div className="situacao-card">
              <span>
                VÍNCULO
              </span>

              <strong>
                {
                  situacaoVinculo
                }
              </strong>
            </div>


            <div className="situacao-card">
              <span>
                TERMO
              </span>

              <strong>
                {
                  situacaoTermo
                }
              </strong>
            </div>

          </div>

        </section>


        <section className="secao vinculo-resumo">

          <div className="titulo-secao">
            VÍNCULO ESPORTIVO
          </div>

          <div className="grade grade-4">

            <Campo
              titulo="Modalidade"
              valor={
                vinculo?.modalidade
              }
            />

            <Campo
              titulo="Temporada"
              valor={
                vinculo?.temporada
              }
            />

            <Campo
              titulo="Início"
              valor={
                formatarData(
                  vinculo?.data_inicio
                )
              }
            />

            <Campo
              titulo="Fim"
              valor={
                formatarData(
                  vinculo?.data_fim
                )
              }
            />

          </div>

        </section>


        <footer className="rodape">

          <div>
            <strong>
              A.D. CANNABRAVA
            </strong>

            <span>
              Associação Desportiva
              Cannabrava
            </span>
          </div>


          <div className="rodape-centro">
            Documento emitido pelo
            sistema de gestão da entidade
          </div>


          <div className="rodape-codigo">
            {codigoFicha}
          </div>

        </footer>

      </section>


      <style>{`

        * {
          box-sizing: border-box;
        }

        .pagina {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
          color: #172033;
        }

        .barra-acoes {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .barra-acoes h1 {
          margin: 5px 0 2px;
          color: #082e69;
          font-size: 28px;
        }

        .barra-acoes p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .voltar {
          color: #1763d6;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .ficha {
          background: #fff;
          border: 1px solid #ccd7e3;
          box-shadow:
            0 5px 18px
            rgba(15, 23, 42, .06);
          padding: 24px 26px 18px;
        }

        .cabecalho {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding-bottom: 12px;
          border-bottom: 3px solid #082e69;
        }

        .identidade-clube {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .escudo {
          width: 62px;
          height: 62px;
          object-fit: contain;
        }

        .associacao {
          color: #168447;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .identidade-clube h2 {
          margin: 3px 0 2px;
          color: #082e69;
          font-size: 19px;
          line-height: 1.1;
        }

        .identidade-clube small {
          color: #64748b;
          font-size: 9px;
        }

        .dados-documento {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          color: #64748b;
          font-size: 9px;
        }

        .dados-documento strong {
          color: #082e69;
          font-size: 11px;
        }

        .identificacao {
          display: grid;
          grid-template-columns:
            105px 1fr;
          gap: 16px;
          padding: 15px 0 5px;
        }

        .foto {
          width: 105px;
          height: 132px;
          border: 1px solid #cfd8e3;
          border-radius: 8px;
          overflow: hidden;
          background: #f4f7fa;
        }

        .foto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sem-foto {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
        }

        .dados-principais {
          min-width: 0;
        }

        .nome-status {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 9px;
        }

        .rotulo {
          display: block;
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .nome-status h3 {
          margin: 2px 0;
          color: #082e69;
          font-size: 20px;
        }

        .nome-status small {
          color: #64748b;
          font-size: 9px;
        }

        .status-atleta {
          padding: 5px 9px;
          border-radius: 999px;
          background: #e8f6ee;
          color: #10733d;
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .secao {
          margin-top: 11px;
        }

        .titulo-secao {
          padding: 5px 8px;
          border-left: 4px solid #168447;
          background: #eef4fb;
          color: #082e69;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .07em;
        }

        .grade {
          display: grid;
          border-left: 1px solid #dde5ed;
          border-top: 1px solid #dde5ed;
        }

        .grade-3 {
          grid-template-columns:
            repeat(3, 1fr);
        }

        .grade-4 {
          grid-template-columns:
            repeat(4, 1fr);
        }

        .campo {
          min-height: 43px;
          padding: 7px 8px;
          border-right: 1px solid #dde5ed;
          border-bottom: 1px solid #dde5ed;
        }

        .campo span {
          display: block;
          color: #718096;
          font-size: 7px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .valor {
          display: block;
          margin-top: 3px;
          color: #172033;
          font-size: 10px;
          line-height: 1.15;
          overflow-wrap: anywhere;
        }

        .situacao-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          border-left: 1px solid #dde5ed;
        }

        .situacao-card {
          min-height: 55px;
          padding: 8px 10px;
          border-right: 1px solid #dde5ed;
          border-bottom: 1px solid #dde5ed;
        }

        .situacao-card span {
          display: block;
          color: #718096;
          font-size: 7px;
          font-weight: 900;
        }

        .situacao-card strong {
          display: block;
          margin-top: 5px;
          color: #082e69;
          font-size: 11px;
        }

        .situacao-card strong.ok {
          color: #11713e;
        }

        .rodape {
          display: grid;
          grid-template-columns:
            1fr 1.4fr 1fr;
          align-items: center;
          gap: 10px;
          margin-top: 15px;
          padding-top: 8px;
          border-top: 2px solid #082e69;
          color: #64748b;
          font-size: 7px;
        }

        .rodape strong {
          display: block;
          color: #082e69;
          font-size: 8px;
        }

        .rodape span {
          display: block;
          margin-top: 1px;
        }

        .rodape-centro {
          text-align: center;
        }

        .rodape-codigo {
          text-align: right;
          font-weight: 800;
        }


        @media(max-width:700px) {

          .identificacao {
            grid-template-columns:
              86px 1fr;
          }

          .foto {
            width: 86px;
            height: 110px;
          }

          .grade-4 {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }


        @media print {

          @page {
            size: A4 portrait;
            margin: 7mm;
          }

          html,
          body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          header,
          nav,
          aside,
          .nao-imprimir {
            display: none !important;
          }

          .pagina {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .ficha {
            width: 100% !important;
            min-height: 0 !important;
            padding:
              3mm
              4mm
              2mm !important;

            border: 0 !important;
            box-shadow: none !important;

            page-break-after: avoid;
            break-after: avoid;
          }

          .cabecalho {
            gap: 3mm;
            padding-bottom: 2mm;
            border-bottom-width: 2px;
          }

          .escudo {
            width: 13mm;
            height: 13mm;
          }

          .identidade-clube {
            gap: 3mm;
          }

          .associacao {
            font-size: 6.2px;
          }

          .identidade-clube h2 {
            margin: 1px 0;
            font-size: 10px;
          }

          .identidade-clube small {
            font-size: 5.8px;
          }

          .dados-documento {
            font-size: 5.8px;
          }

          .dados-documento strong {
            font-size: 7px;
          }

          .identificacao {
            grid-template-columns:
              23mm 1fr;
            gap: 3mm;
            padding:
              2.5mm 0
              0;
          }

          .foto {
            width: 23mm;
            height: 29mm;
            border-radius: 1mm;
          }

          .nome-status {
            margin-bottom: 1.5mm;
          }

          .rotulo {
            font-size: 5.5px;
          }

          .nome-status h3 {
            margin: 1px 0;
            font-size: 11px;
            line-height: 1.05;
          }

          .nome-status small {
            font-size: 5.8px;
          }

          .status-atleta {
            padding: 1mm 1.5mm;
            font-size: 5.5px;

            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .secao {
            margin-top: 1.8mm;
          }

          .titulo-secao {
            padding:
              .9mm 1.4mm;
            border-left-width: 2px;
            font-size: 5.8px;
            line-height: 1;

            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .grade-3 {
            grid-template-columns:
              repeat(3, 1fr)
              !important;
          }

          .grade-4 {
            grid-template-columns:
              repeat(4, 1fr)
              !important;
          }

          .campo {
            min-height: 7.8mm;
            padding:
              1mm 1.3mm;
          }

          .campo span {
            font-size: 5px;
          }

          .valor {
            margin-top: .8mm;
            font-size: 6.7px;
            line-height: 1.05;
          }

          .situacao-card {
            min-height: 9mm;
            padding:
              1.2mm 1.5mm;
          }

          .situacao-card span {
            font-size: 5px;
          }

          .situacao-card strong {
            margin-top: 1mm;
            font-size: 7px;
          }

          .rodape {
            margin-top: 2.5mm;
            padding-top: 1.5mm;
            font-size: 5px;
          }

          .rodape strong {
            font-size: 5.8px;
          }

          .cabecalho,
          .identificacao,
          .secao,
          .rodape {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

      `}</style>

    </main>
  );
}