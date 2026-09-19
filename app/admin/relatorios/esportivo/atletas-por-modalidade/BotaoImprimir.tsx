"use client";

export default function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="botao"
    >
      Imprimir relatório

      <style jsx>{`
        .botao {
          min-height: 40px;
          padding: 0 16px;
          border: 0;
          border-radius: 8px;
          background: #082e69;
          color: white;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .botao:hover {
          background: #0d3e87;
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