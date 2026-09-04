import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotaoImprimir from "../../BotaoImprimir";

function formatarData(data: string | null | undefined) {
  if (!data) return "Não informado";

  const [ano, mes, dia] = data.substring(0, 10).split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function textoStatus(status: string | null | undefined) {
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

  return mapa[status || ""] || status || "Não informado";
}

function DocumentoLinha({
  titulo,
  valor,
}: {
  titulo: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="campo-documento">
      <div className="campo-titulo">{titulo}</div>
      <div className="campo-valor">{valor || "Não informado"}</div>
    </div>
  );
}

export default async function FichaIndividualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: atleta, error: atletaError } =
    await supabase
      .from("atletas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (atletaError || !atleta) {
    notFound();
  }

  const { data: documentos } =
    await supabase
      .from("atleta_documentos")
      .select(`
        id,
        tipo,
        status,
        enviado_em,
        analisado_em
      `)
      .eq("atleta_id", id)
      .order("tipo");

  const { data: vinculo } =
    await supabase
      .from("atleta_vinculos")
      .select("*")
      .eq("atleta_id", id)
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  const { data: termo } =
    await supabase
      .from("termos_compromisso")
      .select(`
        id,
        versao,
        titulo,
        status,
        gerado_em,
        liberado_em,
        assinado_em,
        aceite
      `)
      .eq("atleta_id", id)
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  const hoje =
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date());

  const codigoFicha =
    `FA-${atleta.id
      .replaceAll("-", "")
      .substring(0, 8)
      .toUpperCase()}`;

  const documentosAprovados =
    (documentos || []).filter(
      (documento) =>
        documento.status === "aprovado"
    ).length;

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

          <h1>Ficha do Atleta</h1>

          <p>
            Visualização cadastral e emissão do documento oficial.
          </p>
        </div>

        <BotaoImprimir />
      </div>

      <section className="documento-oficial">
        <div className="cabecalho-documento">
          <div className="marca">
            <img
              src="/escudo.png"
              alt="A.D. Cannabrava"
            />

            <div>
              <div className="nome-associacao">
                ASSOCIAÇÃO DESPORTIVA CANNABRAVA
              </div>

              <div className="subtitulo-associacao">
                A.D. CANNABRAVA
              </div>

              <div className="sistema">
                Sistema Oficial de Gestão
              </div>
            </div>
          </div>

          <div className="identificacao-documento">
            <strong>FICHA CADASTRAL DO ATLETA</strong>
            <span>Código: {codigoFicha}</span>
            <span>Emissão: {hoje}</span>
          </div>
        </div>

        <div className="faixa-documento">
          IDENTIFICAÇÃO DO ATLETA
        </div>

        <div className="grade grade-4">
          <DocumentoLinha
            titulo="Nome completo"
            valor={atleta.nome}
          />

          <DocumentoLinha
            titulo="Apelido"
            valor={atleta.apelido}
          />

          <DocumentoLinha
            titulo="CPF"
            valor={atleta.cpf}
          />

          <DocumentoLinha
            titulo="RG"
            valor={atleta.rg}
          />

          <DocumentoLinha
            titulo="Data de nascimento"
            valor={formatarData(atleta.data_nascimento)}
          />

          <DocumentoLinha
            titulo="Telefone"
            valor={atleta.telefone}
          />

          <DocumentoLinha
            titulo="E-mail"
            valor={atleta.email}
          />

          <DocumentoLinha
            titulo="Situação cadastral"
            valor={
              <span className="status">
                {textoStatus(atleta.status)}
              </span>
            }
          />
        </div>

        <div className="faixa-documento">
          ENDEREÇO
        </div>

        <div className="grade grade-4">
          <DocumentoLinha
            titulo="CEP"
            valor={atleta.cep}
          />

          <DocumentoLinha
            titulo="Logradouro"
            valor={atleta.logradouro}
          />

          <DocumentoLinha
            titulo="Número"
            valor={atleta.numero}
          />

          <DocumentoLinha
            titulo="Complemento"
            valor={atleta.complemento}
          />

          <DocumentoLinha
            titulo="Bairro"
            valor={atleta.bairro}
          />

          <DocumentoLinha
            titulo="Cidade"
            valor={atleta.cidade}
          />

          <DocumentoLinha
            titulo="UF"
            valor={atleta.uf}
          />
        </div>

        <div className="faixa-documento">
          INFORMAÇÕES ESPORTIVAS
        </div>

        <div className="grade grade-4">
          <DocumentoLinha
            titulo="Modalidade"
            valor={atleta.modalidade}
          />

          <DocumentoLinha
            titulo="Posição"
            valor={atleta.posicao}
          />

          <DocumentoLinha
            titulo="Número da camisa"
            valor={atleta.numero_camisa}
          />

          <DocumentoLinha
            titulo="Pé preferencial"
            valor={atleta.pe_preferencial}
          />

          <DocumentoLinha
            titulo="Altura"
            valor={
              atleta.altura
                ? `${atleta.altura} m`
                : null
            }
          />

          <DocumentoLinha
            titulo="Peso"
            valor={
              atleta.peso
                ? `${atleta.peso} kg`
                : null
            }
          />

          <DocumentoLinha
            titulo="Registro esportivo"
            valor={atleta.registro_esportivo}
          />
        </div>

        <div className="faixa-documento">
          CONTATO DE EMERGÊNCIA
        </div>

        <div className="grade grade-3">
          <DocumentoLinha
            titulo="Nome"
            valor={atleta.emergencia_nome}
          />

          <DocumentoLinha
            titulo="Parentesco"
            valor={atleta.emergencia_parentesco}
          />

          <DocumentoLinha
            titulo="Telefone"
            valor={atleta.emergencia_telefone}
          />
        </div>

        <div className="faixa-documento">
          VÍNCULO COM A ASSOCIAÇÃO
        </div>

        <div className="grade grade-4">
          <DocumentoLinha
            titulo="Modalidade"
            valor={vinculo?.modalidade}
          />

          <DocumentoLinha
            titulo="Temporada"
            valor={vinculo?.temporada}
          />

          <DocumentoLinha
            titulo="Início do vínculo"
            valor={formatarData(vinculo?.data_inicio)}
          />

          <DocumentoLinha
            titulo="Fim do vínculo"
            valor={formatarData(vinculo?.data_fim)}
          />

          <DocumentoLinha
            titulo="Situação do vínculo"
            valor={textoStatus(vinculo?.status)}
          />
        </div>

        <div className="faixa-documento">
          CONTROLE DOCUMENTAL
        </div>

        <div className="resumo-documental">
          <div>
            <strong>{documentos?.length || 0}</strong>
            <span>Documentos cadastrados</span>
          </div>

          <div>
            <strong>{documentosAprovados}</strong>
            <span>Documentos aprovados</span>
          </div>

          <div>
            <strong>
              {termo
                ? textoStatus(termo.status)
                : "Não gerado"}
            </strong>
            <span>Termo de compromisso</span>
          </div>
        </div>

        {(documentos || []).length > 0 && (
          <table className="tabela-documentos">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Situação</th>
                <th>Envio</th>
                <th>Análise</th>
              </tr>
            </thead>

            <tbody>
              {(documentos || []).map((documento) => (
                <tr key={documento.id}>
                  <td>
                    {documento.tipo
                      .replaceAll("_", " ")
                      .toUpperCase()}
                  </td>

                  <td>
                    {textoStatus(documento.status)}
                  </td>

                  <td>
                    {formatarData(documento.enviado_em)}
                  </td>

                  <td>
                    {formatarData(documento.analisado_em)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="faixa-documento">
          TERMO DE COMPROMISSO
        </div>

        <div className="grade grade-4">
          <DocumentoLinha
            titulo="Situação"
            valor={
              termo
                ? textoStatus(termo.status)
                : "Não gerado"
            }
          />

          <DocumentoLinha
            titulo="Versão"
            valor={termo?.versao}
          />

          <DocumentoLinha
            titulo="Data de geração"
            valor={formatarData(termo?.gerado_em)}
          />

          <DocumentoLinha
            titulo="Data de assinatura"
            valor={formatarData(termo?.assinado_em)}
          />
        </div>

        <div className="declaracao">
          <strong>DECLARAÇÃO</strong>

          <p>
            A presente ficha consolida os dados cadastrais,
            esportivos e documentais registrados no Sistema
            Oficial de Gestão da Associação Desportiva Cannabrava
            para fins de controle administrativo e esportivo.
          </p>
        </div>

        <div className="assinaturas">
          <div className="assinatura">
            <div className="linha-assinatura" />

            <strong>
              {atleta.nome}
            </strong>

            <span>Atleta</span>
          </div>

          <div className="assinatura">
            <div className="linha-assinatura" />

            <strong>
              Associação Desportiva Cannabrava
            </strong>

            <span>Responsável pela entidade</span>
          </div>
        </div>

        <div className="rodape-documento">
          <div>
            Associação Desportiva Cannabrava
          </div>

          <div>
            Documento emitido pelo Sistema Oficial de Gestão
          </div>

          <div>
            {codigoFicha}
          </div>
        </div>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .pagina {
          padding: 20px 30px 35px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .barra-acoes {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 18px;
        }

        .barra-acoes h1 {
          margin: 5px 0 2px;
          color: #082e69;
          font-size: 30px;
        }

        .barra-acoes p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .voltar {
          color: #1763d6;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
        }

        .documento-oficial {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cfd9e6;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
          padding: 28px 32px 22px;
          color: #172033;
        }

        .cabecalho-documento {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding-bottom: 16px;
          border-bottom: 3px solid #082e69;
        }

        .marca {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .marca img {
          width: 78px;
          height: 78px;
          object-fit: contain;
        }

        .nome-associacao {
          color: #082e69;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: .025em;
        }

        .subtitulo-associacao {
          margin-top: 2px;
          color: #168447;
          font-size: 13px;
          font-weight: 800;
        }

        .sistema {
          margin-top: 4px;
          color: #64748b;
          font-size: 11px;
        }

        .identificacao-documento {
          min-width: 250px;
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 3px;
          color: #475569;
          font-size: 11px;
        }

        .identificacao-documento strong {
          color: #082e69;
          font-size: 14px;
        }

        .faixa-documento {
          margin-top: 17px;
          padding: 7px 10px;
          background: #eef4fb;
          border-left: 4px solid #168447;
          color: #082e69;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .07em;
        }

        .grade {
          display: grid;
          gap: 0;
          border-left: 1px solid #dce3eb;
          border-top: 1px solid #dce3eb;
        }

        .grade-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        .grade-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .campo-documento {
          min-height: 55px;
          padding: 9px 10px;
          border-right: 1px solid #dce3eb;
          border-bottom: 1px solid #dce3eb;
        }

        .campo-titulo {
          color: #6b778c;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .campo-valor {
          margin-top: 4px;
          color: #172033;
          font-size: 12px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .status {
          color: #08733d;
          font-weight: 800;
        }

        .resumo-documental {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-left: 1px solid #dce3eb;
        }

        .resumo-documental > div {
          padding: 11px 12px;
          border-right: 1px solid #dce3eb;
          border-bottom: 1px solid #dce3eb;
          display: flex;
          flex-direction: column;
        }

        .resumo-documental strong {
          color: #082e69;
          font-size: 16px;
        }

        .resumo-documental span {
          margin-top: 2px;
          color: #64748b;
          font-size: 9px;
          text-transform: uppercase;
        }

        .tabela-documentos {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }

        .tabela-documentos th {
          padding: 7px 9px;
          text-align: left;
          background: #f7f9fc;
          color: #475569;
          border: 1px solid #dce3eb;
          font-size: 9px;
        }

        .tabela-documentos td {
          padding: 7px 9px;
          border: 1px solid #dce3eb;
          color: #334155;
        }

        .declaracao {
          margin-top: 18px;
          padding: 12px 14px;
          border: 1px solid #dce3eb;
          background: #fbfcfe;
        }

        .declaracao strong {
          color: #082e69;
          font-size: 10px;
        }

        .declaracao p {
          margin: 5px 0 0;
          color: #475569;
          font-size: 10px;
          line-height: 1.55;
          text-align: justify;
        }

        .assinaturas {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          margin: 55px 45px 30px;
        }

        .assinatura {
          text-align: center;
          display: flex;
          flex-direction: column;
          font-size: 10px;
        }

        .linha-assinatura {
          border-top: 1px solid #334155;
          margin-bottom: 6px;
        }

        .assinatura strong {
          color: #172033;
        }

        .assinatura span {
          color: #64748b;
          margin-top: 2px;
        }

        .rodape-documento {
          padding-top: 8px;
          border-top: 2px solid #082e69;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          color: #64748b;
          font-size: 8px;
        }

        .rodape-documento div:nth-child(2) {
          text-align: center;
        }

        .rodape-documento div:last-child {
          text-align: right;
        }

        @media max-width: 950px {
          .grade-4,
          .grade-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }

          html,
          body {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
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

          .documento-oficial {
            width: 100% !important;
            margin: 0 !important;
            padding: 3mm 4mm 2mm !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .cabecalho-documento {
            gap: 4mm;
            padding-bottom: 2mm;
            border-bottom-width: 2px;
          }

          .marca {
            gap: 3mm;
          }

          .marca img {
            width: 14mm;
            height: 14mm;
          }

          .nome-associacao {
            font-size: 12px;
            line-height: 1.05;
          }

          .subtitulo-associacao {
            margin-top: 1px;
            font-size: 9px;
          }

          .sistema {
            margin-top: 1px;
            font-size: 7px;
          }

          .identificacao-documento {
            min-width: 46mm;
            gap: 1px;
            font-size: 7px;
          }

          .identificacao-documento strong {
            font-size: 9px;
          }

          .faixa-documento {
            margin-top: 1.8mm;
            padding: 1mm 1.7mm;
            border-left-width: 3px;
            font-size: 7.2px;
            line-height: 1;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .grade {
            gap: 0;
          }

          .grade-4 {
            grid-template-columns: repeat(4, 1fr) !important;
          }

          .grade-3 {
            grid-template-columns: repeat(3, 1fr) !important;
          }

          .campo-documento {
            min-height: 8mm;
            padding: 1mm 1.4mm;
          }

          .campo-titulo {
            font-size: 5.8px;
            line-height: 1;
          }

          .campo-valor {
            margin-top: 1.2mm;
            font-size: 7.5px;
            line-height: 1.05;
          }

          .resumo-documental > div {
            padding: 1.3mm 1.7mm;
          }

          .resumo-documental strong {
            font-size: 9px;
            line-height: 1;
          }

          .resumo-documental span {
            margin-top: 1mm;
            font-size: 5.5px;
          }

          .tabela-documentos {
            font-size: 6.5px;
          }

          .tabela-documentos th {
            padding: 1mm 1.5mm;
            font-size: 5.8px;
          }

          .tabela-documentos td {
            padding: 1mm 1.5mm;
          }

          .declaracao {
            margin-top: 1.8mm;
            padding: 1.5mm 2mm;
          }

          .declaracao strong {
            font-size: 6.5px;
          }

          .declaracao p {
            margin-top: 1mm;
            font-size: 6.3px;
            line-height: 1.25;
          }

          .assinaturas {
            gap: 18mm;
            margin: 7mm 10mm 3mm;
          }

          .assinatura {
            font-size: 6.5px;
          }

          .linha-assinatura {
            margin-bottom: 1mm;
          }

          .rodape-documento {
            padding-top: 1.5mm;
            border-top-width: 1px;
            gap: 3mm;
            font-size: 5px;
          }

          .faixa-documento,
          .grade,
          .resumo-documental,
          .tabela-documentos,
          .declaracao,
          .assinaturas {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}