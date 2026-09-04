"use client";

export default function BotaoImprimirFicha() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="botao-imprimir-ficha"
    >
      Imprimir ficha

      <style jsx>{`
        .botao-imprimir-ficha {
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid #d6e0eb;
          border-radius: 8px;
          background: #fff;
          color: #082e69;
          font-size: 8px;
          font-weight: 900;
          cursor: pointer;
        }

        .botao-imprimir-ficha:hover {
          background: #f4f8fd;
        }

        @media print {
          .botao-imprimir-ficha {
            display: none !important;
          }
        }
      `}</style>
    </button>
  );
}