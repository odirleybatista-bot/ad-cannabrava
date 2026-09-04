"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  atletaId: string;
  nome: string;
  fotoUrl: string | null;
  statusFoto: string | null;
  nomeArquivo: string | null;
};

export default function Foto3x4Client({
  atletaId,
  nome,
  fotoUrl,
  statusFoto,
  nomeArquivo,
}: Props) {
  const router = useRouter();

  const [arquivo, setArquivo] =
    useState<File | null>(null);

  const [enviando, setEnviando] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  async function enviarFoto() {
    if (!arquivo) {
      setMensagem(
        "Selecione uma foto em JPG ou PNG."
      );
      return;
    }

    setEnviando(true);
    setMensagem("");

    try {
      const formData = new FormData();

      formData.append(
        "atletaId",
        atletaId
      );

      formData.append(
        "tipo",
        "foto_3x4"
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

      const texto =
        await resposta.text();

      let resultado: {
        sucesso?: boolean;
        mensagem?: string;
      } = {};

      try {
        resultado =
          texto
            ? JSON.parse(texto)
            : {};
      } catch {
        resultado = {
          sucesso: false,
          mensagem:
            texto ||
            "Resposta inválida do servidor.",
        };
      }

      if (!resposta.ok) {
        throw new Error(
          resultado.mensagem ||
            "Não foi possível enviar a foto."
        );
      }

      setMensagem(
        "Foto 3x4 enviada com sucesso."
      );

      setArquivo(null);

      router.refresh();
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao enviar a foto."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina">
      <section className="topo">
        <div>
          <span>
            PORTAL DO ATLETA
          </span>

          <h1>Foto 3x4</h1>

          <p>
            Atualize a fotografia utilizada
            na sua ficha cadastral.
          </p>
        </div>
      </section>

      <section className="painel">
        <div className="foto-area">
          <div className="foto">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={`Foto de ${nome}`}
              />
            ) : (
              <div className="sem-foto">
                <strong>
                  Sem foto
                </strong>

                <span>
                  3x4
                </span>
              </div>
            )}
          </div>

          <div className="informacoes">
            <span className="label">
              ATLETA
            </span>

            <h2>{nome}</h2>

            {nomeArquivo && (
              <p>
                Arquivo atual:{" "}
                <strong>
                  {nomeArquivo}
                </strong>
              </p>
            )}

            <div className="status">
              {fotoUrl
                ? statusFoto ===
                  "aprovado"
                  ? "Foto aprovada"
                  : "Foto enviada"
                : "Foto pendente"}
            </div>
          </div>
        </div>

        <div className="upload">
          <label htmlFor="foto">
            Selecionar nova foto
          </label>

          <input
            id="foto"
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) =>
              setArquivo(
                event.target.files?.[0] ||
                  null
              )
            }
          />

          <small>
            JPG ou PNG. Tamanho máximo:
            5 MB.
          </small>

          {arquivo && (
            <div className="selecionado">
              {arquivo.name}
            </div>
          )}

          {mensagem && (
            <div className="mensagem">
              {mensagem}
            </div>
          )}

          <button
            type="button"
            onClick={enviarFoto}
            disabled={
              !arquivo ||
              enviando
            }
          >
            {enviando
              ? "Enviando..."
              : fotoUrl
              ? "Atualizar foto"
              : "Enviar foto 3x4"}
          </button>
        </div>
      </section>

      <style jsx>{`
        .pagina {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 22px 26px 40px;
        }

        .topo {
          margin-bottom: 14px;
        }

        .topo span {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
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

        .painel {
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 14px;
          background: white;
        }

        .foto-area {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px;
          border-bottom: 1px solid #edf1f5;
        }

        .foto {
          flex: 0 0 150px;
          width: 150px;
          height: 190px;
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #f8fafc;
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
          color: #94a3b8;
        }

        .sem-foto strong {
          color: #64748b;
          font-size: 12px;
        }

        .sem-foto span {
          margin-top: 4px;
          font-size: 9px;
        }

        .label {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .informacoes h2 {
          margin: 3px 0 8px;
          color: #082e69;
          font-size: 22px;
        }

        .informacoes p {
          color: #64748b;
          font-size: 9px;
        }

        .status {
          width: fit-content;
          margin-top: 10px;
          padding: 6px 9px;
          border-radius: 999px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 900;
        }

        .upload {
          padding: 22px 24px;
        }

        .upload label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 9px;
          font-weight: 900;
        }

        .upload input {
          display: block;
          width: 100%;
          padding: 10px;
          border: 1px solid #d6e0eb;
          border-radius: 9px;
          background: #f8fafc;
        }

        .upload small {
          display: block;
          margin-top: 6px;
          color: #94a3b8;
          font-size: 8px;
        }

        .selecionado {
          margin-top: 10px;
          padding: 9px 10px;
          border-radius: 7px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 8px;
          font-weight: 800;
        }

        .mensagem {
          margin-top: 10px;
          padding: 9px 10px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-size: 8px;
          font-weight: 800;
        }

        button {
          min-height: 43px;
          margin-top: 14px;
          padding: 0 17px;
          border: 0;
          border-radius: 9px;
          background: #082e69;
          color: white;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 15px 10px 30px;
          }

          .foto-area {
            align-items: flex-start;
            flex-direction: column;
            padding: 18px;
          }

          .foto {
            width: 130px;
            height: 165px;
          }

          .upload {
            padding: 18px;
          }

          button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}