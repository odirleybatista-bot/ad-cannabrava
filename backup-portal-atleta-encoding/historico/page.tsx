export default function HistoricoPage() {
  const eventos = [
    {
      data: "30/08/2026",
      titulo: "Atleta ativo",
      descricao:
        "Cadastro concluÃ­do e vÃ­nculo esportivo ativo junto Ã  A.D. Cannabrava.",
      tipo: "sucesso",
    },
    {
      data: "29/08/2026",
      titulo: "Termo de Compromisso assinado",
      descricao:
        "Aceite do Termo de Compromisso registrado no sistema.",
      tipo: "sucesso",
    },
    {
      data: "28/08/2026",
      titulo: "VinculaÃ§Ã£o Ã  modalidade",
      descricao:
        "Atleta vinculado Ã  modalidade Futebol para a temporada 2026.",
      tipo: "info",
    },
    {
      data: "27/08/2026",
      titulo: "DocumentaÃ§Ã£o aprovada",
      descricao:
        "Todos os documentos obrigatÃ³rios foram analisados e aprovados.",
      tipo: "sucesso",
    },
    {
      data: "26/08/2026",
      titulo: "Documentos enviados",
      descricao:
        "Documentos obrigatÃ³rios enviados para anÃ¡lise da associaÃ§Ã£o.",
      tipo: "info",
    },
    {
      data: "25/08/2026",
      titulo: "PrÃ©-cadastro realizado",
      descricao:
        "Cadastro inicial do atleta realizado no Portal do Atleta.",
      tipo: "info",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#08265a]">
          HistÃ³rico
        </h1>

        <p className="mt-1 text-slate-500">
          Acompanhe os principais registros do seu vÃ­nculo com a A.D. Cannabrava.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#08265a]">
              Linha do tempo
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Eventos relacionados ao seu cadastro e vÃ­nculo esportivo.
            </p>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-[15px] top-0 w-px bg-slate-200" />

            <div className="space-y-7">
              {eventos.map((evento, index) => (
                <div
                  key={`${evento.data}-${index}`}
                  className="relative flex gap-5"
                >
                  <div
                    className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white ${
                      evento.tipo === "sucesso"
                        ? "bg-emerald-500"
                        : "bg-blue-600"
                    }`}
                  />

                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-800">
                        {evento.titulo}
                      </h3>

                      <span className="text-xs font-medium text-slate-400">
                        {evento.data}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {evento.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              SituaÃ§Ã£o atual
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-600">
              Ativo
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              VÃ­nculo regular com a associaÃ§Ã£o.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Modalidade
            </p>

            <p className="mt-2 text-xl font-black text-[#08265a]">
              Futebol
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Temporada 2026
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ingresso
            </p>

            <p className="mt-2 text-xl font-black text-[#08265a]">
              25/08/2026
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Data do primeiro cadastro.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}