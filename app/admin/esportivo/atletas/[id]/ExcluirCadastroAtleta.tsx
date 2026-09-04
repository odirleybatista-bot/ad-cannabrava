"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { excluirCadastroAtleta } from "./actions";

type Props = {
  atletaId: string;
  nomeAtleta: string;
};

export default function ExcluirCadastroAtleta({
  atletaId,
  nomeAtleta,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [confirmacao, setConfirmacao] =
    useState("");

  const [processando, setProcessando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const podeExcluir =
    confirmacao
      .trim()
      .toUpperCase() ===
    "EXCLUIR";

  async function excluir() {
    if (!podeExcluir || processando) {
      return;
    }

    setProcessando(true);
    setErro(null);

    try {
      const resultado =
        await excluirCadastroAtleta(
          atletaId
        );

      if (!resultado.sucesso) {
        setErro(
          resultado.mensagem ||
            "Não foi possível excluir o cadastro."
        );

        setProcessando(false);
        return;
      }

      router.push(
        "/admin/esportivo/atletas"
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setErro(
        "Ocorreu um erro ao excluir o cadastro."
      );

      setProcessando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setConfirmacao("");
          setErro(null);
          setAberto(true);
        }}
        className="botao-excluir"
      >
        Excluir cadastro
      </button>

      {aberto && (
        <div className="fundo-modal">
          <div className="modal">
            <div className="icone-alerta">
              !
            </div>

            <span className="rotulo">
              AÇÃO ADMINISTRATIVA
            </span>

            <h2>
              Excluir cadastro do atleta?
            </h2>

            <p>
              Você está prestes a excluir
              o processo cadastral de
              <strong>
                {" "}
                {nomeAtleta}
              </strong>.
            </p>

            <div className="aviso">
              <strong>
                O que será excluído:
              </strong>

              <ul>
                <li>
                  cadastro esportivo do atleta;
                </li>
                <li>
                  documentos enviados;
                </li>
                <li>
                  vínculo esportivo;
                </li>
                <li>
                  Termo de Compromisso.
                </li>
              </ul>

              <p>
                O usuário e o acesso ao
                Portal do Atleta serão
                mantidos.
              </p>
            </div>

            <label>
              Digite{" "}
              <strong>EXCLUIR</strong>{" "}
              para confirmar:
            </label>

            <input
              type="text"
              value={confirmacao}
              onChange={(event) =>
                setConfirmacao(
                  event.target.value
                )
              }
              placeholder="EXCLUIR"
              autoComplete="off"
            />

            {erro && (
              <div className="erro">
                {erro}
              </div>
            )}

            <div className="acoes">
              <button
                type="button"
                onClick={() =>
                  setAberto(false)
                }
                disabled={processando}
                className="cancelar"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={excluir}
                disabled={
                  !podeExcluir ||
                  processando
                }
                className="confirmar"
              >
                {processando
                  ? "Excluindo..."
                  : "Excluir e reiniciar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .botao-excluir {
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fff;
          color: #b91c1c;
          font-size: 8px;
          font-weight: 900;
          cursor: pointer;
        }

        .botao-excluir:hover {
          background: #fef2f2;
        }

        .fundo-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(3, 15, 35, .72);
          backdrop-filter: blur(3px);
        }

        .modal {
          width: 100%;
          max-width: 470px;
          padding: 26px;
          border-radius: 18px;
          background: #fff;
          box-shadow:
            0 25px 80px rgba(0,0,0,.28);
        }

        .icone-alerta {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 13px;
          border-radius: 50%;
          background: #fee2e2;
          color: #b91c1c;
          font-size: 20px;
          font-weight: 900;
        }

        .rotulo {
          color: #b91c1c;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        h2 {
          margin: 5px 0 8px;
          color: #082e69;
          font-size: 22px;
        }

        p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .aviso {
          margin: 18px 0;
          padding: 14px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fff7f7;
          color: #7f1d1d;
          font-size: 11px;
        }

        .aviso strong {
          display: block;
          margin-bottom: 5px;
        }

        .aviso ul {
          margin: 5px 0 10px;
          padding-left: 18px;
        }

        .aviso li {
          margin: 3px 0;
        }

        .aviso p {
          color: #991b1b;
          font-size: 10px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          color: #334155;
          font-size: 10px;
        }

        input {
          width: 100%;
          height: 42px;
          padding: 0 11px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          color: #0f172a;
          font-weight: 800;
        }

        input:focus {
          border-color: #b91c1c;
        }

        .erro {
          margin-top: 10px;
          padding: 9px;
          border-radius: 7px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 10px;
          font-weight: 700;
        }

        .acoes {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 20px;
        }

        .acoes button {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .cancelar {
          border: 1px solid #dbe3ec;
          background: #fff;
          color: #475569;
        }

        .confirmar {
          border: 0;
          background: #b91c1c;
          color: #fff;
        }

        .confirmar:disabled {
          cursor: not-allowed;
          opacity: .4;
        }

        @media print {
          .botao-excluir,
          .fundo-modal {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}