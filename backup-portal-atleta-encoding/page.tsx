export default function PortalAtletaPage() {
  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#08265a]">
          OlÃ¡, Atleta!
        </h1>

        <p className="mt-1 text-slate-500">
          Acompanhe sua situaÃ§Ã£o junto Ã  A.D. Cannabrava.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            SituaÃ§Ã£o
          </p>

          <p className="mt-2 text-2xl font-black text-emerald-600">
            Ativo
          </p>

          <p className="mt-2 text-xs text-slate-500">
            VÃ­nculo regular com a associaÃ§Ã£o
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            Documentos
          </p>

          <p className="mt-2 text-2xl font-black text-[#08265a]">
            4 de 4
          </p>

          <p className="mt-2 text-xs text-slate-500">
            DocumentaÃ§Ã£o aprovada
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            Termo
          </p>

          <p className="mt-2 text-2xl font-black text-emerald-600">
            Assinado
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Termo de compromisso regular
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            PrÃ³ximo jogo
          </p>

          <p className="mt-2 text-xl font-black text-[#08265a]">
            A definir
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Nenhuma convocaÃ§Ã£o pendente
          </p>
        </div>

      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#08265a]">
              Meu cadastro
            </h2>

            <p className="text-sm text-slate-500">
              SituaÃ§Ã£o atual do processo
            </p>
          </div>

          <div className="space-y-4">

            <Etapa titulo="PrÃ©-cadastro" concluido />
            <Etapa titulo="Documentos enviados" concluido />
            <Etapa titulo="Documentos aprovados" concluido />
            <Etapa titulo="VinculaÃ§Ã£o Ã  modalidade" concluido />
            <Etapa titulo="Termo assinado" concluido />
            <Etapa titulo="Atleta ativo" concluido />

          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-bold text-[#08265a]">
            NotificaÃ§Ãµes recentes
          </h2>

          <div className="mt-5 space-y-4">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Cadastro atualizado
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Seus dados estÃ£o regulares.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Nenhuma pendÃªncia
              </p>

              <p className="mt-1 text-xs text-slate-500">
                NÃ£o hÃ¡ documentos aguardando correÃ§Ã£o.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

function Etapa({
  titulo,
  concluido,
}: {
  titulo: string;
  concluido?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
          concluido
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {concluido ? "âœ“" : "â€¢"}
      </div>

      <div className="flex-1 border-b border-slate-100 pb-4">
        <p className="text-sm font-semibold text-slate-800">
          {titulo}
        </p>
      </div>

    </div>
  );
}