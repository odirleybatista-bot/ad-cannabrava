"use client";

import { useMemo, useRef, useState } from "react";

type Documento = {
  id?: string;
  tipo: string;
  nome_arquivo?: string | null;
  status?: string | null;
  observacao?: string | null;
  caminho_arquivo?: string | null;
  url_assinada?: string | null;
};

type Props = {
  atletaId: string;
  documentos: Documento[];
};

const obrigatorios = [
  {
    tipo: "foto_3x4",
    titulo: "Foto 3x4",
    subtitulo: "Registro oficial do atleta",
    descricao:
      "Envie uma foto atual, de frente, com boa iluminação, sem filtros e com o rosto claramente visível.",
    accept: "image/jpeg,image/png",
    maxMb: 5,
    somenteImagem: true,
  },
  {
    tipo: "identidade",
    titulo: "Documento de Identidade",
    subtitulo: "RG, CNH ou documento oficial",
    descricao:
      "Envie um documento oficial com foto, legível e sem cortes.",
    accept: "application/pdf,image/jpeg,image/png",
    maxMb: 10,
    somenteImagem: false,
  },
  {
    tipo: "residencia",
    titulo: "Comprovante de Residência",
    subtitulo: "Comprovante atualizado",
    descricao:
      "Envie um comprovante de residência recente em nome do atleta ou responsável.",
    accept: "application/pdf,image/jpeg,image/png",
    maxMb: 10,
    somenteImagem: false,
  },
  {
    tipo: "eleitoral",
    titulo: "Regularidade Eleitoral",
    subtitulo: "Certidão eleitoral",
    descricao:
      "Envie a certidão de regularidade eleitoral válida.",
    accept: "application/pdf,image/jpeg,image/png",
    maxMb: 10,
    somenteImagem: false,
  },
];

function statusLabel(status?: string | null) {
  const mapa: Record<string, string> = {
    pendente: "Pendente",
    enviado: "Enviado",
    em_analise: "Em análise",
    aprovado: "Aprovado",
    correcao_solicitada: "Correção solicitada",
    rejeitado: "Rejeitado",
  };

  return mapa[status || ""] || "Pendente";
}

function statusClasse(status?: string | null) {
  return `status-${status || "pendente"}`;
}

export default function DocumentosClient({
  atletaId,
  documentos,
}: Props) {
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] =
    useState<string | null>(null);

  const [previews, setPreviews] =
    useState<Record<string, string>>({});

  const refs =
    useRef<Record<string, HTMLInputElement | null>>({});

  const enviados = useMemo(() => {
    return obrigatorios.filter((item) =>
      documentos.some(
        (documento) =>
          documento.tipo === item.tipo &&
          documento.status &&
          documento.status !== "pendente"
      )
    ).length;
  }, [documentos]);

  const aprovados = useMemo(() => {
    return obrigatorios.filter((item) =>
      documentos.some(
        (documento) =>
          documento.tipo === item.tipo &&
          documento.status === "aprovado"
      )
    ).length;
  }, [documentos]);

  const temCorrecao = documentos.some(
    (documento) =>
      documento.status === "correcao_solicitada"
  );

  async function enviarArquivo(
    tipo: string,
    arquivo: File
  ) {
    setErro("");

    const config = obrigatorios.find(
      (item) => item.tipo === tipo
    );

    if (!config) return;

    if (arquivo.size > config.maxMb * 1024 * 1024) {
      setErro(
        `O arquivo deve ter no máximo ${config.maxMb} MB.`
      );
      return;
    }

    if (
      config.somenteImagem &&
      !["image/jpeg", "image/png"].includes(
        arquivo.type
      )
    ) {
      setErro(
        "A foto 3x4 deve estar em formato JPG ou PNG."
      );
      return;
    }

    if (tipo === "foto_3x4") {
      const preview = URL.createObjectURL(arquivo);

      setPreviews((atual) => ({
        ...atual,
        [tipo]: preview,
      }));
    }

    setEnviando(tipo);

    try {
      const formData = new FormData();

      formData.append(
        "atletaId",
        atletaId
      );

      formData.append(
        "tipo",
        tipo
      );

      formData.append(
        "arquivo",
        arquivo
      );

      const resposta = await fetch(
        "/api/portal-atleta/documentos/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const textoResposta =
        await resposta.text();

      let resultado: {
        sucesso?: boolean;
        mensagem?: string;
      } = {};

      try {
        resultado =
          textoResposta
            ? JSON.parse(textoResposta)
            : {};
      } catch {
        resultado = {
          sucesso: false,
          mensagem:
            textoResposta ||
            "O servidor retornou uma resposta inválida.",
        };
      }

      if (!resposta.ok) {
        throw new Error(
          resultado.mensagem ||
            `Não foi possível enviar o arquivo. Código ${resposta.status}.`
        );
      }

      window.location.reload();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o arquivo."
      );
    } finally {
      setEnviando(null);
    }
  }

  return (
    <main className="pagina">
      <section className="cabecalho">
        <div>
          <span className="identificador">
            PORTAL DO ATLETA
          </span>

          <h1>Documentos</h1>

          <p>
            Envie os documentos obrigatórios e acompanhe
            a situação de cada análise.
          </p>
        </div>

        <div className="resumo">
          <div>
            <span>ENVIADOS</span>
            <strong>
              {enviados} de 4
            </strong>
          </div>

          <div>
            <span>APROVADOS</span>
            <strong>
              {aprovados} de 4
            </strong>
          </div>
        </div>
      </section>

      {temCorrecao && (
        <div className="alerta correcao">
          <strong>
            Atenção: existe documento com correção solicitada.
          </strong>

          <span>
            Verifique a observação da administração e
            envie novamente o arquivo corrigido.
          </span>
        </div>
      )}

      {erro && (
        <div className="alerta erro">
          {erro}
        </div>
      )}

      <section className="grade-documentos">
        {obrigatorios.map((item, indice) => {
          const documento =
            documentos.find(
              (doc) =>
                doc.tipo === item.tipo
            );

          const preview =
            previews[item.tipo] ||
            documento?.url_assinada ||
            null;

          const status =
            statusLabel(
              documento?.status
            );

          return (
            <article
              key={item.tipo}
              className={`documento-card ${
                item.tipo === "foto_3x4"
                  ? "foto-card"
                  : ""
              }`}
            >
              <div className="numero">
                {indice + 1}
              </div>

              <div className="documento-conteudo">
                <div className="documento-topo">
                  <div>
                    <span className="subtitulo">
                      {item.subtitulo}
                    </span>

                    <h2>
                      {item.titulo}
                    </h2>
                  </div>

                  <span
                    className={`status ${statusClasse(
                      documento?.status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                {item.tipo === "foto_3x4" && (
                  <div className="foto-area">
                    <div className="foto-preview">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Foto 3x4 do atleta"
                        />
                      ) : (
                        <div className="foto-placeholder">
                          <strong>3x4</strong>
                          <span>
                            Foto do atleta
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="foto-orientacao">
                      <strong>
                        Padrão recomendado
                      </strong>

                      <span>
                        Foto vertical, atual, fundo neutro,
                        sem filtros e com o rosto centralizado.
                      </span>

                      <small>
                        JPG ou PNG • até 5 MB
                      </small>
                    </div>
                  </div>
                )}

                <p className="descricao">
                  {item.descricao}
                </p>

                {documento?.nome_arquivo && (
                  <div className="arquivo-atual">
                    <span>
                      ARQUIVO ENVIADO
                    </span>

                    <strong>
                      {documento.nome_arquivo}
                    </strong>
                  </div>
                )}

                {documento?.observacao && (
                  <div className="observacao">
                    <span>
                      OBSERVAÇÃO DA ANÁLISE
                    </span>

                    <strong>
                      {documento.observacao}
                    </strong>
                  </div>
                )}
              </div>

              <div className="acoes">
                <input
                  ref={(elemento) => {
                    refs.current[
                      item.tipo
                    ] = elemento;
                  }}
                  type="file"
                  accept={item.accept}
                  hidden
                  onChange={(event) => {
                    const arquivo =
                      event.target.files?.[0];

                    if (arquivo) {
                      enviarArquivo(
                        item.tipo,
                        arquivo
                      );
                    }

                    event.target.value = "";
                  }}
                />

                <button
                  type="button"
                  disabled={
                    enviando === item.tipo
                  }
                  onClick={() =>
                    refs.current[
                      item.tipo
                    ]?.click()
                  }
                >
                  {enviando === item.tipo
                    ? "Enviando..."
                    : documento
                    ? "Substituir arquivo"
                    : "Selecionar arquivo"}
                </button>

                <small>
                  Máximo {item.maxMb} MB
                </small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rodape-status">
        <div>
          <span>
            ETAPA DOCUMENTAL
          </span>

          <strong>
            {enviados === 4
              ? aprovados === 4
                ? "Documentação aprovada"
                : "Documentação enviada"
              : "Documentação incompleta"}
          </strong>

          <p>
            {enviados === 4
              ? aprovados === 4
                ? "Todos os documentos obrigatórios foram aprovados."
                : "Todos os documentos foram enviados e aguardam conclusão da análise."
              : `Ainda faltam ${
                  4 - enviados
                } documento${
                  4 - enviados === 1
                    ? ""
                    : "s"
                } obrigatório${
                  4 - enviados === 1
                    ? ""
                    : "s"
                }.`}
          </p>
        </div>

        <div className="progresso">
          <div className="barra">
            <div
              style={{
                width: `${
                  (enviados / 4) * 100
                }%`,
              }}
            />
          </div>

          <strong>
            {Math.round(
              (enviados / 4) * 100
            )}
            %
          </strong>
        </div>
      </section>

      <style jsx>{`
        .pagina {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 22px 28px 38px;
        }

        .cabecalho {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 16px;
        }

        .identificador {
          color: #168447;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .cabecalho h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: 29px;
        }

        .cabecalho p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
        }

        .resumo {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(120px, 1fr));
          overflow: hidden;
          border: 1px solid #cfe0f4;
          border-radius: 11px;
          background: #eef5ff;
        }

        .resumo div {
          padding: 10px 14px;
        }

        .resumo div + div {
          border-left: 1px solid #cfe0f4;
        }

        .resumo span {
          display: block;
          color: #1763d6;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .resumo strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 14px;
        }

        .alerta {
          margin-bottom: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 9px;
        }

        .alerta strong {
          display: block;
          font-size: 10px;
        }

        .alerta span {
          display: block;
          margin-top: 3px;
        }

        .alerta.correcao {
          border: 1px solid #fed7aa;
          background: #fff7ed;
          color: #9a5200;
        }

        .alerta.erro {
          border: 1px solid #fecaca;
          background: #fff1f2;
          color: #b91c1c;
        }

        .grade-documentos {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .documento-card {
          position: relative;
          display: grid;
          grid-template-columns:
            38px minmax(0, 1fr) 190px;
          gap: 14px;
          align-items: center;
          padding: 15px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: #fff;
        }

        .foto-card {
          border-left: 3px solid #168447;
        }

        .numero {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eef5ff;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
        }

        .documento-conteudo {
          min-width: 0;
        }

        .documento-topo {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .subtitulo {
          display: block;
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        .documento-topo h2 {
          margin: 2px 0 0;
          color: #082e69;
          font-size: 15px;
        }

        .status {
          flex: 0 0 auto;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 7.5px;
          font-weight: 900;
          white-space: nowrap;
        }

        .status-pendente {
          background: #f1f5f9;
          color: #64748b;
        }

        .status-enviado {
          background: #eaf2ff;
          color: #1763d6;
        }

        .status-em_analise {
          background: #fff5e8;
          color: #b96900;
        }

        .status-aprovado {
          background: #e7f7ee;
          color: #168447;
        }

        .status-correcao_solicitada {
          background: #fff1e8;
          color: #c05b00;
        }

        .status-rejeitado {
          background: #fff1f2;
          color: #b91c1c;
        }

        .descricao {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.45;
        }

        .foto-area {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }

        .foto-preview {
          flex: 0 0 75px;
          width: 75px;
          height: 100px;
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .foto-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .foto-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #94a3b8;
          text-align: center;
        }

        .foto-placeholder strong {
          color: #64748b;
          font-size: 13px;
        }

        .foto-placeholder span {
          margin-top: 2px;
          font-size: 7px;
        }

        .foto-orientacao strong {
          display: block;
          color: #082e69;
          font-size: 9px;
        }

        .foto-orientacao span {
          display: block;
          max-width: 390px;
          margin-top: 3px;
          color: #64748b;
          font-size: 8px;
          line-height: 1.4;
        }

        .foto-orientacao small {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 7px;
        }

        .arquivo-atual {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .arquivo-atual span,
        .observacao span {
          display: block;
          color: #94a3b8;
          font-size: 6.5px;
          font-weight: 900;
        }

        .arquivo-atual strong {
          display: block;
          margin-top: 2px;
          overflow: hidden;
          color: #536178;
          font-size: 8px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .observacao {
          margin-top: 8px;
          padding: 9px 10px;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          background: #fff7ed;
        }

        .observacao span {
          color: #b96900;
        }

        .observacao strong {
          display: block;
          margin-top: 3px;
          color: #8b4c00;
          font-size: 8.5px;
          line-height: 1.4;
        }

        .acoes {
          display: flex;
          align-items: stretch;
          flex-direction: column;
          gap: 5px;
        }

        .acoes button {
          width: 100%;
          min-height: 40px;
          padding: 0 12px;
          border: 1px solid #0a3776;
          border-radius: 9px;
          background: #fff;
          color: #082e69;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .acoes button:hover {
          background: #f5f9ff;
        }

        .acoes button:disabled {
          opacity: .55;
          cursor: wait;
        }

        .acoes small {
          color: #94a3b8;
          font-size: 7px;
          text-align: center;
        }

        .rodape-status {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 280px;
          gap: 25px;
          align-items: center;
          margin-top: 12px;
          padding: 14px 16px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .rodape-status > div > span {
          display: block;
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .rodape-status > div > strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 11px;
        }

        .rodape-status p {
          margin: 3px 0 0;
          color: #94a3b8;
          font-size: 8px;
        }

        .progresso {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .barra {
          flex: 1;
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: #edf1f6;
        }

        .barra div {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #1763d6,
            #168447
          );
        }

        .progresso strong {
          color: #082e69;
          font-size: 11px;
        }

        @media (max-width: 900px) {
          .documento-card {
            grid-template-columns:
              38px minmax(0, 1fr);
          }

          .acoes {
            grid-column: 2;
            display: grid;
            grid-template-columns:
              minmax(0, 190px) auto;
            align-items: center;
          }

          .rodape-status {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 15px 11px 28px;
          }

          .cabecalho {
            display: block;
          }

          .cabecalho h1 {
            font-size: 24px;
          }

          .cabecalho p {
            font-size: 9.5px;
            line-height: 1.45;
          }

          .resumo {
            width: 100%;
            margin-top: 11px;
          }

          .documento-card {
            grid-template-columns: 30px minmax(0, 1fr);
            gap: 9px;
            padding: 12px;
          }

          .numero {
            width: 29px;
            height: 29px;
            font-size: 8px;
          }

          .documento-topo {
            display: block;
          }

          .status {
            display: inline-flex;
            margin-top: 6px;
          }

          .foto-area {
            align-items: flex-start;
          }

          .foto-preview {
            flex-basis: 68px;
            width: 68px;
            height: 90px;
          }

          .acoes {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
          }

          .acoes button {
            min-height: 44px;
          }

          .rodape-status {
            padding: 12px;
          }
        }

        @media (max-width: 390px) {
          .pagina {
            padding-left: 8px;
            padding-right: 8px;
          }

          .resumo {
            grid-template-columns: 1fr 1fr;
          }

          .resumo div {
            padding: 9px;
          }

          .foto-area {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}