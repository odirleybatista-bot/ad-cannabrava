import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentoActions from "./DocumentoActions";
import VinculoForm from "./VinculoForm";
import TermoActions from "./TermoActions";
import BotaoImprimirFicha from "./BotaoImprimirFicha";
import ExcluirCadastroAtleta from "./ExcluirCadastroAtleta";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Documento = {
  id: string;
  tipo: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  status: string;
  observacao: string | null;
  enviado_em: string;
  analisado_em: string | null;
};

const DOCUMENTOS_FORMAIS = [
  "identidade",
  "residencia",
  "eleitoral",
];

export default async function AtletaDetalhePage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user: usuarioAuth },
  } = await supabase.auth.getUser();

  let ehAdministrador = false;

  if (usuarioAuth) {
    const { data: usuarioInterno } =
      await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_user_id", usuarioAuth.id)
        .maybeSingle();

    if (usuarioInterno) {
      const { data: usuarioPerfis } =
        await supabase
          .from("usuario_perfis")
          .select("perfil_id")
          .eq("usuario_id", usuarioInterno.id);

      const idsPerfis =
        (usuarioPerfis || []).map(
          (item) => item.perfil_id
        );

      if (idsPerfis.length > 0) {
        const { data: perfis } =
          await supabase
            .from("perfis")
            .select("nome")
            .in("id", idsPerfis);

        ehAdministrador =
          (perfis || []).some(
            (perfil) =>
              String(perfil.nome || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase() === "administrador"
          );
      }
    }
  }

  const { data: atleta, error } =
    await supabase
      .from("atletas")
      .select("*")
      .eq("id", id)
      .single();

  if (error || !atleta) {
    notFound();
  }

  const { data: documentos } =
    await supabase
      .from("atleta_documentos")
      .select(`
        id,
        tipo,
        nome_arquivo,
        caminho_arquivo,
        status,
        observacao,
        enviado_em,
        analisado_em
      `)
      .eq("atleta_id", id)
      .order("enviado_em", {
        ascending: true,
      });

  const listaDocumentos =
    (documentos || []) as Documento[];

  const foto =
    listaDocumentos.find(
      (documento) =>
        documento.tipo === "foto_3x4"
    ) || null;

  let fotoUrl: string | null = null;

  if (foto?.caminho_arquivo) {
    const { data } =
      await supabase.storage
        .from("atleta-documentos")
        .createSignedUrl(
          foto.caminho_arquivo,
          3600
        );

    fotoUrl = data?.signedUrl || null;
  }

  const { data: termo } =
    await supabase
      .from("termos_compromisso")
      .select(`
        id,
        status,
        versao,
        gerado_em,
        liberado_em,
        assinado_em,
        conteudo
      `)
      .eq("atleta_id", id)
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

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

  const documentosAprovados =
    DOCUMENTOS_FORMAIS.filter(
      (tipo) =>
        listaDocumentos.some(
          (documento) =>
            documento.tipo === tipo &&
            documento.status === "aprovado"
        )
    ).length;

  const documentacaoCompleta =
    documentosAprovados === 3;

  const possuiVinculo =
    Boolean(vinculo);

  const termoAssinado =
    termo?.status === "assinado";

  const atletaAtivo =
    atleta.status === "ativo";

  const etapas =
    [
      documentacaoCompleta,
      possuiVinculo,
      termoAssinado,
      atletaAtivo,
    ].filter(Boolean).length;

  const progresso = etapas * 25;

  const proximaEtapa =
    definirProximaEtapa({
      documentacaoCompleta,
      possuiVinculo,
      termoAssinado,
      atletaAtivo,
    });

  return (
    <main className="pagina">
      <Link
        href="/admin/esportivo/atletas"
        className="voltar"
      >
        ← Voltar para atletas
      </Link>

      <section className="hero">
        <div className="perfil">
          <div className="foto">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={`Foto de ${atleta.nome}`}
              />
            ) : (
              <div className="sem-foto">
                <strong>
                  {iniciais(atleta.nome)}
                </strong>
                <span>SEM FOTO</span>
              </div>
            )}
          </div>

          <div className="perfil-info">
            <span className="rotulo">
              GESTÃO ESPORTIVA • ATLETA
            </span>

            <h1>{atleta.nome}</h1>

            <p>
              {atleta.apelido ||
                "Atleta da A.D. Cannabrava"}
            </p>

            <div className="chips">
              <span>
                {atleta.modalidade ||
                  "Futebol"}
              </span>

              <span>
                {atleta.posicao ||
                  "Posição não informada"}
              </span>

              <span>
                Nº{" "}
                {atleta.numero_camisa ??
                  "—"}
              </span>

              <span>
                {calcularIdade(
                  atleta.data_nascimento
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="acoes-status">
          <div className="acoes-topo">
            <BotaoImprimirFicha />

            {ehAdministrador && (
              <ExcluirCadastroAtleta
                atletaId={id}
                nomeAtleta={atleta.nome}
              />
            )}
          </div>

          <div className="status-box">
          <span>STATUS DO ATLETA</span>

          <strong>
            {nomeStatus(
              atleta.status
            )}
          </strong>

          <small>
            Situação cadastral e esportiva
          </small>
          </div>
        </div>
      </section>

      <section className="progresso">
        <div className="progresso-topo">
          <div>
            <span>
              PROCESSO DE ATIVAÇÃO
            </span>

            <strong>
              {progresso}% concluído
            </strong>
          </div>

          <small>
            {etapas} de 4 etapas
          </small>
        </div>

        <div className="barra">
          <div
            style={{
              width: `${progresso}%`,
            }}
          />
        </div>

        <div className="etapas">
          <Etapa
            titulo="Documentação"
            descricao={`${documentosAprovados}/3 aprovados`}
            ok={
              documentacaoCompleta
            }
          />

          <Etapa
            titulo="Vínculo"
            descricao={
              possuiVinculo
                ? "Definido"
                : "Pendente"
            }
            ok={possuiVinculo}
          />

          <Etapa
            titulo="Termo"
            descricao={
              termoAssinado
                ? "Assinado"
                : termo
                ? nomeStatusTermo(
                    termo.status
                  )
                : "Não gerado"
            }
            ok={termoAssinado}
          />

          <Etapa
            titulo="Ativação"
            descricao={
              atletaAtivo
                ? "Ativo"
                : "Pendente"
            }
            ok={atletaAtivo}
          />
        </div>
      </section>

      <section className="indicadores">
        <Indicador
          titulo="Documentação"
          valor={
            documentacaoCompleta
              ? "Completa"
              : `${documentosAprovados}/3`
          }
          ok={documentacaoCompleta}
        />

        <Indicador
          titulo="Foto 3x4"
          valor={
            foto
              ? nomeStatusDocumento(
                  foto.status
                )
              : "Pendente"
          }
          ok={Boolean(foto)}
        />

        <Indicador
          titulo="Vínculo"
          valor={
            possuiVinculo
              ? "Definido"
              : "Pendente"
          }
          ok={possuiVinculo}
        />

        <Indicador
          titulo="Termo"
          valor={
            termoAssinado
              ? "Assinado"
              : "Pendente"
          }
          ok={termoAssinado}
        />
      </section>

      <section
        className={atletaAtivo ? "proxima concluida" : "proxima"}
      >
        <div className="proxima-icone">
          {atletaAtivo ? "✓" : "!"}
        </div>

        <div>
          <span>
            {atletaAtivo
              ? "PROCESSO CONCLUÍDO"
              : "PRÓXIMA ETAPA"}
          </span>

          <strong>
            {proximaEtapa.titulo}
          </strong>

          <p>
            {proximaEtapa.descricao}
          </p>
        </div>
      </section>

      <div className="duas-colunas">
        <section className="card">
          <TituloCard
            titulo="Identificação"
            descricao="Dados pessoais do atleta."
          />

          <div className="info-grid">
            <Info
              label="Nome completo"
              valor={atleta.nome}
            />

            <Info
              label="Apelido"
              valor={atleta.apelido}
            />

            <Info
              label="CPF"
              valor={atleta.cpf}
            />

            <Info
              label="RG"
              valor={atleta.rg}
            />

            <Info
              label="Nascimento"
              valor={formatarDataNascimento(
                atleta.data_nascimento
              )}
            />

            <Info
              label="Telefone"
              valor={atleta.telefone}
            />

            <Info
              label="E-mail"
              valor={atleta.email}
            />

            <Info
              label="Cadastro"
              valor={formatarDataHora(
                atleta.criado_em
              )}
            />
          </div>
        </section>

        <section className="card">
          <TituloCard
            titulo="Informações esportivas"
            descricao="Dados utilizados na gestão esportiva."
          />

          <div className="info-grid esporte">
            <Info
              label="Modalidade"
              valor={
                atleta.modalidade
              }
            />

            <Info
              label="Posição"
              valor={
                atleta.posicao
              }
            />

            <Info
              label="Camisa"
              valor={
                atleta.numero_camisa !==
                null
                  ? String(
                      atleta.numero_camisa
                    )
                  : null
              }
            />

            <Info
              label="Pé preferencial"
              valor={
                atleta.pe_preferencial
              }
            />

            <Info
              label="Altura"
              valor={
                atleta.altura !== null
                  ? `${atleta.altura} cm`
                  : null
              }
            />

            <Info
              label="Peso"
              valor={
                atleta.peso !== null
                  ? `${atleta.peso} kg`
                  : null
              }
            />
          </div>
        </section>
      </div>

      <section className="card">
        <TituloCard
          titulo="Documentação"
          descricao="Analise os arquivos enviados pelo atleta."
        />

        {listaDocumentos.length ===
        0 ? (
          <div className="vazio">
            Nenhum documento enviado.
          </div>
        ) : (
          <div className="documentos">
            {listaDocumentos.map(
              (documento) => (
                <article
                  key={documento.id}
                  className="documento"
                >
                  <div className="doc-info">
                    <div className="doc-icone">
                      {documento.tipo ===
                      "foto_3x4"
                        ? "FOTO"
                        : "DOC"}
                    </div>

                    <div>
                      <strong>
                        {nomeDocumento(
                          documento.tipo
                        )}
                      </strong>

                      <span className="nome-arquivo">
                        {
                          documento.nome_arquivo
                        }
                      </span>

                      <div className="doc-meta">
                        <StatusDocumento
                          status={
                            documento.status
                          }
                        />

                        <small>
                          Enviado em{" "}
                          {formatarDataHora(
                            documento.enviado_em
                          )}
                        </small>
                      </div>

                      {documento.observacao && (
                        <div className="observacao">
                          <b>
                            Observação
                          </b>

                          <p>
                            {
                              documento.observacao
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <DocumentoActions
                    atletaId={id}
                    documentoId={
                      documento.id
                    }
                    caminhoArquivo={
                      documento.caminho_arquivo
                    }
                    status={
                      documento.status
                    }
                  />
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-topo">
          <TituloCard
            titulo="Vínculo esportivo"
            descricao="Modalidade, temporada e período de participação."
          />

          <Badge
            ok={possuiVinculo}
            texto={
              possuiVinculo
                ? "Vínculo registrado"
                : "Aguardando vínculo"
            }
          />
        </div>

        <VinculoForm
          atletaId={id}
          statusAtleta={
            atleta.status
          }
          modalidadeAtual={
            atleta.modalidade
          }
        />
      </section>

      <section className="card">
        <div className="card-topo">
          <TituloCard
            titulo="Termo de Compromisso"
            descricao="Geração, liberação e assinatura do termo."
          />

          <Badge
            ok={termoAssinado}
            texto={
              termo
                ? nomeStatusTermo(
                    termo.status
                  )
                : "Sem termo"
            }
          />
        </div>

        {termo && (
          <div className="termo-resumo">
            <Info
              label="Versão"
              valor={
                termo.versao
              }
            />

            <Info
              label="Status"
              valor={
                nomeStatusTermo(
                  termo.status
                )
              }
            />

            <Info
              label="Gerado em"
              valor={
                termo.gerado_em
                  ? formatarDataHora(
                      termo.gerado_em
                    )
                  : "—"
              }
            />

            <Info
              label="Assinado em"
              valor={
                termo.assinado_em
                  ? formatarDataHora(
                      termo.assinado_em
                    )
                  : "—"
              }
            />
          </div>
        )}

        <TermoActions
          atletaId={id}
          statusAtleta={
            atleta.status
          }
          termoId={
            termo?.id || null
          }
          termoStatus={
            termo?.status || null
          }
        />
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 20px 24px 40px;
        }

        .voltar {
          display: inline-flex;
          margin-bottom: 11px;
          color: #1763d6;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 20px;
          border: 1px solid #dce5f0;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #fff,
              #f4f8fd
            );
        }

        .perfil {
          display: flex;
          align-items: center;
          gap: 18px;
          min-width: 0;
        }

        .foto {
          flex: 0 0 105px;
          width: 105px;
          height: 128px;
          overflow: hidden;
          border: 4px solid #fff;
          border-radius: 13px;
          background: #eaf2ff;
          box-shadow:
            0 5px 18px rgba(8,46,105,.14);
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
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #1763d6;
        }

        .sem-foto strong {
          font-size: 25px;
        }

        .sem-foto span {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
        }

        .rotulo {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .perfil-info h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: clamp(24px,3vw,34px);
        }

        .perfil-info p {
          margin: 0 0 9px;
          color: #64748b;
          font-size: 10px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .chips span {
          padding: 5px 8px;
          border-radius: 999px;
          background: #eef5ff;
          color: #36516f;
          font-size: 7px;
          font-weight: 900;
        }

        .status-box {
          min-width: 190px;
          padding: 13px 15px;
          border-radius: 11px;
          background: #082e69;
          color: #fff;
        }

        .status-box span {
          display: block;
          font-size: 6px;
          font-weight: 900;
          opacity: .6;
        }

        .status-box strong {
          display: block;
          margin-top: 3px;
          font-size: 18px;
        }

        .status-box small {
          display: block;
          margin-top: 3px;
          font-size: 7px;
          opacity: .58;
        }

        .progresso {
          margin-top: 10px;
          padding: 14px 16px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .progresso-topo {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progresso-topo span {
          display: block;
          color: #64748b;
          font-size: 6px;
          font-weight: 900;
        }

        .progresso-topo strong {
          display: block;
          margin-top: 2px;
          color: #082e69;
          font-size: 11px;
        }

        .progresso-topo small {
          color: #94a3b8;
          font-size: 7px;
        }

        .barra {
          height: 5px;
          margin: 10px 0 12px;
          overflow: hidden;
          border-radius: 999px;
          background: #e8edf3;
        }

        .barra div {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #1763d6,
              #168447
            );
        }

        .etapas {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 7px;
        }

        .etapa {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 1px solid #edf1f5;
          border-radius: 8px;
          background: #fbfcfd;
        }

        .etapa-icone {
          flex: 0 0 25px;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e9eef5;
          color: #94a3b8;
          font-size: 8px;
          font-weight: 900;
        }

        .etapa.ok .etapa-icone {
          background: #e7f7ee;
          color: #168447;
        }

        .etapa strong {
          display: block;
          color: #334155;
          font-size: 8px;
        }

        .etapa span {
          display: block;
          color: #94a3b8;
          font-size: 6px;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .indicador {
          padding: 11px 13px;
          border: 1px solid #dce5f0;
          border-radius: 10px;
          background: #fff;
        }

        .indicador.ok {
          border-left:
            3px solid #168447;
        }

        .indicador span {
          display: block;
          color: #64748b;
          font-size: 6px;
          font-weight: 900;
        }

        .indicador strong {
          display: block;
          margin-top: 4px;
          color: #082e69;
          font-size: 13px;
        }

        .proxima {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 10px;
          padding: 12px 14px;
          border: 1px solid #cfe0f4;
          border-radius: 10px;
          background: #f2f7fd;
        }

        .proxima.concluida {
          border-color: #c8ead5;
          background: #eefaf3;
        }

        .proxima-icone {
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #082e69;
          color: white;
          font-weight: 900;
        }

        .proxima.concluida
        .proxima-icone {
          background: #168447;
        }

        .proxima span {
          display: block;
          color: #1763d6;
          font-size: 6px;
          font-weight: 900;
        }

        .proxima strong {
          display: block;
          margin-top: 2px;
          color: #082e69;
          font-size: 10px;
        }

        .proxima p {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 8px;
        }

        .duas-colunas {
          display: grid;
          grid-template-columns:
            1.25fr .75fr;
          gap: 10px;
          margin-top: 10px;
        }

        .card {
          margin-top: 10px;
          padding: 16px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .duas-colunas .card {
          margin-top: 0;
        }

        .titulo-card {
          margin-bottom: 14px;
        }

        .titulo-card span {
          color: #168447;
          font-size: 6px;
          font-weight: 900;
        }

        .titulo-card h2 {
          margin: 2px 0;
          color: #082e69;
          font-size: 15px;
        }

        .titulo-card p {
          margin: 0;
          color: #94a3b8;
          font-size: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 14px;
        }

        .info-grid.esporte {
          grid-template-columns:
            repeat(3,1fr);
        }

        .info span {
          display: block;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
        }

        .info strong {
          display: block;
          margin-top: 3px;
          color: #334155;
          font-size: 9px;
          overflow-wrap: anywhere;
        }

        .documentos {
          display: grid;
          gap: 8px;
        }

        .documento {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          padding: 11px;
          border: 1px solid #edf1f5;
          border-radius: 9px;
          background: #fbfcfd;
        }

        .doc-info {
          display: flex;
          gap: 10px;
          min-width: 0;
        }

        .doc-icone {
          flex: 0 0 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 6px;
          font-weight: 900;
        }

        .doc-info strong {
          display: block;
          color: #334155;
          font-size: 9px;
        }

        .nome-arquivo {
          display: block;
          margin-top: 2px;
          max-width: 480px;
          overflow: hidden;
          color: #94a3b8;
          font-size: 7px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .doc-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 5px;
        }

        .doc-meta small {
          color: #94a3b8;
          font-size: 6px;
        }

        .observacao {
          margin-top: 6px;
          padding: 7px;
          border-radius: 6px;
          background: #fff6e6;
        }

        .observacao b {
          color: #b96900;
          font-size: 6px;
        }

        .observacao p {
          margin: 2px 0 0;
          color: #8b5e18;
          font-size: 7px;
        }

        .card-topo {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .badge {
          padding: 6px 9px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 7px;
          font-weight: 900;
          white-space: nowrap;
        }

        .badge.ok {
          background: #e7f7ee;
          color: #168447;
        }

        .termo-resumo {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 8px;
          margin-bottom: 14px;
          padding: 10px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .vazio {
          padding: 35px;
          border: 1px dashed #d6e0eb;
          border-radius: 9px;
          color: #94a3b8;
          font-size: 9px;
          text-align: center;
        }

        @media(max-width:1000px) {
          .duas-colunas {
            grid-template-columns:1fr;
          }

          .info-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media(max-width:800px) {
          .pagina {
            padding:14px 10px 30px;
          }

          .hero {
            align-items:flex-start;
            flex-direction:column;
          }

          .status-box {
            width:100%;
          }

          .etapas,
          .indicadores {
            grid-template-columns:
              repeat(2,1fr);
          }

          .documento {
            align-items:stretch;
            flex-direction:column;
          }
        }

        @media(max-width:560px) {
          .foto {
            flex-basis:82px;
            width:82px;
            height:100px;
          }

          .perfil {
            align-items:flex-start;
          }

          .perfil-info h1 {
            font-size:22px;
          }

          .info-grid,
          .info-grid.esporte {
            grid-template-columns:
              repeat(2,1fr);
          }

          .card-topo {
            flex-direction:column;
          }

          .termo-resumo {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        .acoes-status {
          display: flex;
          align-items: flex-end;
          flex-direction: column;
          gap: 8px;
        }

        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            background: #fff !important;
          }

          .voltar,
          .acoes-topo,
          .proxima,
          .documentos button,
          form button {
            display: none !important;
          }

          .pagina {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .hero,
          .progresso,
          .indicadores,
          .card {
            break-inside: avoid;
            box-shadow: none !important;
          }

          .documento {
            break-inside: avoid;
          }

          .status-box {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}

function TituloCard({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="titulo-card">
      <span>FICHA DO ATLETA</span>
      <h2>{titulo}</h2>
      <p>{descricao}</p>
    </div>
  );
}

function Info({
  label,
  valor,
}: {
  label: string;
  valor?: string | null;
}) {
  return (
    <div className="info">
      <span>{label.toUpperCase()}</span>
      <strong>
        {valor || "Não informado"}
      </strong>
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  ok,
}: {
  titulo: string;
  valor: string;
  ok: boolean;
}) {
  return (
    <div
      className={ok ? "indicador ok" : "indicador"}
    >
      <span>
        {titulo.toUpperCase()}
      </span>

      <strong>{valor}</strong>
    </div>
  );
}

function Etapa({
  titulo,
  descricao,
  ok,
}: {
  titulo: string;
  descricao: string;
  ok: boolean;
}) {
  return (
    <div
      className={ok ? "etapa ok" : "etapa"}
    >
      <div className="etapa-icone">
        {ok ? "✓" : "•"}
      </div>

      <div>
        <strong>{titulo}</strong>
        <span>{descricao}</span>
      </div>
    </div>
  );
}

function Badge({
  ok,
  texto,
}: {
  ok: boolean;
  texto: string;
}) {
  return (
    <span
      className={ok ? "badge ok" : "badge"}
    >
      {ok ? "✓ " : ""}
      {texto}
    </span>
  );
}

function StatusDocumento({
  status,
}: {
  status: string;
}) {
  const mapa: Record<
    string,
    {
      texto: string;
      classe: string;
    }
  > = {
    enviado: {
      texto: "Enviado",
      classe:
        "bg-blue-100 text-blue-700",
    },

    em_analise: {
      texto: "Em análise",
      classe:
        "bg-amber-100 text-amber-700",
    },

    aprovado: {
      texto: "Aprovado",
      classe:
        "bg-emerald-100 text-emerald-700",
    },

    correcao_solicitada: {
      texto: "Correção solicitada",
      classe:
        "bg-red-100 text-red-700",
    },

    rejeitado: {
      texto: "Rejeitado",
      classe:
        "bg-red-100 text-red-700",
    },
  };

  const atual =
    mapa[status] || {
      texto: status,
      classe:
        "bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${atual.classe}`}
    >
      {atual.texto}
    </span>
  );
}

function nomeDocumento(
  tipo: string
) {
  const nomes: Record<string,string> = {
    foto_3x4: "Foto 3x4",
    identidade:
      "Documento de Identidade",
    residencia:
      "Comprovante de Residência",
    eleitoral:
      "Certidão de Quitação Eleitoral",
  };

  return nomes[tipo] || tipo;
}

function nomeStatusDocumento(
  status: string
) {
  const nomes: Record<string,string> = {
    enviado: "Enviada",
    em_analise: "Em análise",
    aprovado: "Aprovada",
    correcao_solicitada:
      "Correção solicitada",
    rejeitado: "Rejeitada",
  };

  return nomes[status] || status;
}

function nomeStatus(
  status: string
) {
  const nomes: Record<string,string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados:
      "Documentos enviados",
    em_analise: "Em análise",
    correcao_solicitada:
      "Correção solicitada",
    aprovado: "Aprovado",
    vinculado: "Vinculado",
    termo_liberado:
      "Termo liberado",
    ativo: "Ativo",
    inativo: "Inativo",
  };

  return nomes[status] || status;
}

function nomeStatusTermo(
  status: string
) {
  const nomes: Record<string,string> = {
    rascunho: "Rascunho",
    gerado: "Gerado",
    liberado: "Liberado",
    aguardando_assinatura:
      "Aguardando assinatura",
    assinado: "Assinado",
    cancelado: "Cancelado",
  };

  return nomes[status] || status;
}

function definirProximaEtapa({
  documentacaoCompleta,
  possuiVinculo,
  termoAssinado,
  atletaAtivo,
}: {
  documentacaoCompleta: boolean;
  possuiVinculo: boolean;
  termoAssinado: boolean;
  atletaAtivo: boolean;
}) {
  if (atletaAtivo) {
    return {
      titulo: "Atleta ativo",
      descricao:
        "Todas as etapas foram concluídas e o atleta está liberado para participação esportiva.",
    };
  }

  if (!documentacaoCompleta) {
    return {
      titulo:
        "Concluir análise documental",
      descricao:
        "Aprove Identidade, Comprovante de Residência e Regularidade Eleitoral.",
    };
  }

  if (!possuiVinculo) {
    return {
      titulo:
        "Definir vínculo esportivo",
      descricao:
        "A documentação está completa. O próximo passo é registrar o vínculo esportivo.",
    };
  }

  if (!termoAssinado) {
    return {
      titulo:
        "Concluir Termo de Compromisso",
      descricao:
        "O vínculo está definido. O Termo de Compromisso precisa ser assinado pelo atleta.",
    };
  }

  return {
    titulo:
      "Aguardando ativação",
    descricao:
      "Todas as condições estão concluídas. O sistema deverá alterar automaticamente o status para Ativo.",
  };
}

function iniciais(
  nome: string
) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0,2)
    .map(
      (parte) =>
        parte[0]
    )
    .join("")
    .toUpperCase();
}

function calcularIdade(
  dataNascimento: string | null
) {
  if (!dataNascimento) {
    return "Idade não informada";
  }

  const nascimento =
    new Date(
      `${dataNascimento}T00:00:00`
    );

  const hoje =
    new Date();

  let idade =
    hoje.getFullYear() -
    nascimento.getFullYear();

  const mes =
    hoje.getMonth() -
    nascimento.getMonth();

  if (
    mes < 0 ||
    (
      mes === 0 &&
      hoje.getDate() <
        nascimento.getDate()
    )
  ) {
    idade--;
  }

  return `${idade} anos`;
}

function formatarDataNascimento(
  data: string | null
) {
  if (!data) {
    return "Não informado";
  }

  const [ano,mes,dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(
    new Date(data)
  );
}