import Link from "next/link";

export default function PortalAtletaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* CABEÃƒâ€¡ALHO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-3">

          {/* LOGO */}
          <Link
            href="/portal-atleta"
            className="flex items-center gap-3"
          >
            <img
              src="/escudo.png"
              alt="A.D. Cannabrava"
              className="h-14 w-14 object-contain"
            />

            <div>
              <div className="text-lg font-black text-[#08265a]">
                A.D. CANNABRAVA
              </div>

              <div className="text-xs text-slate-500">
                Portal do Atleta
              </div>
            </div>
          </Link>

          {/* USUÃƒÂRIO */}
          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold text-[#08265a]">
                Portal do Atleta
              </div>

              <div className="text-xs text-slate-500">
                ÃƒÂrea do atleta
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#08265a] text-sm font-bold text-white">
              AT
            </div>

            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Sair
            </Link>

          </div>
        </div>
      </header>

      {/* MENU SUPERIOR */}
      <nav className="bg-[#08265a] shadow-sm">
        <div className="mx-auto flex max-w-[1500px] items-center overflow-x-auto px-6">

          <Link
            href="/portal-atleta"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Resumo
          </Link>

          <Link
            href="/portal-atleta/dados"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Meus Dados
          </Link>

          <Link
            href="/portal-atleta/documentos"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Documentos
          </Link>

          <Link
            href="/portal-atleta/termo"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Termo
          </Link>

          <Link
            href="/portal-atleta/desempenho"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Desempenho
          </Link>

          <Link
            href="/portal-atleta/historico"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            HistÃƒÂ³rico
          </Link>

          <Link
            href="/portal-atleta/notificacoes"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            NotificaÃƒÂ§ÃƒÂµes
          </Link>

        </div>
      </nav>

      {/* CONTEÃƒÅ¡DO */}
      <main className="mx-auto max-w-[1500px] p-6 lg:p-8">
        {children}
      </main>

    </div>
  );
}