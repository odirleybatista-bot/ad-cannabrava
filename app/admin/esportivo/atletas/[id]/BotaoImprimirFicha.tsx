"use client";

export default function BotaoImprimirFicha() {

  function abrirFicha() {

    const partes =
      window.location.pathname
        .split("/")
        .filter(Boolean);

    const indiceAtletas =
      partes.indexOf("atletas");

    const atletaId =
      indiceAtletas >= 0
        ? partes[indiceAtletas + 1]
        : null;

    if (!atletaId) {
      alert(
        "Não foi possível identificar o atleta."
      );

      return;
    }

    const url =
      `/admin/relatorios/esportivo/ficha-atleta/${atletaId}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <button
      type="button"
      onClick={abrirFicha}
      className="botao-imprimir-ficha"
    >
      Imprimir ficha

      <style jsx>{`

        .botao-imprimir-ficha {
          min-height: 38px;
          padding: 0 13px;

          border:
            1px solid
            #d6e0eb;

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

      `}</style>

    </button>
  );
}