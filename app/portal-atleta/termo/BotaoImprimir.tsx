"use client";

export default function BotaoImprimir() {
  return (
    <button
      type="button"
      className="botao-imprimir"
      onClick={() => window.print()}
    >
      Imprimir termo

      <style jsx>{`
        .botao-imprimir {
          min-height: 42px;
          padding: 0 16px;
          border: 1px solid #0a3776;
          border-radius: 9px;
          background: #ffffff;
          color: #082e69;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .botao-imprimir:hover {
          background: #f4f8ff;
        }

        @media (max-width: 700px) {
          .botao-imprimir {
            width: 100%;
            min-height: 45px;
          }
        }

        @media print {
          .botao-imprimir {
            display: none !important;
          }
        }
      `}</style>
    </button>
  );
}