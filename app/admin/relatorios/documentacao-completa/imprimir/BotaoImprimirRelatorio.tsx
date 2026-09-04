"use client";

export default function BotaoImprimirRelatorio() {
  return (
    <button
      type="button"
      onClick={() =>
        window.print()
      }
      className="botao"
    >
      Imprimir relatório

      <style jsx>{`
        .botao {
          min-height: 42px;
          padding: 0 16px;
          border: 0;
          border-radius: 9px;
          background: #082e69;
          color: white;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        @media print {
          .botao {
            display: none !important;
          }
        }
      `}</style>
    </button>
  );
}