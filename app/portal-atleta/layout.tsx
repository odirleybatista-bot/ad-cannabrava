import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCurrentUser,
  possuiPerfil,
} from "@/lib/auth/current-user";
import { sair } from "@/app/login/actions";

export default async function PortalAtletaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario =
    await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  /*
    Se for usuário administrativo e não for atleta,
    não deve usar o Portal do Atleta.
  */
  const administrativo =
    possuiPerfil(
      usuario,
      [
        "Administrador",
        "Diretoria",
        "Comissão Técnica",
      ]
    );

  const atleta =
    possuiPerfil(
      usuario,
      ["Atleta"]
    );

  if (
    administrativo &&
    !atleta
  ) {
    redirect("/admin");
  }

  /*
    Todo usuário do Portal deve ser tratado como atleta.
    Mesmo que ainda não tenha ficha em public.atletas.
  */
  const nome =
    usuario.nome ||
    usuario.email ||
    "Atleta";

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-3">

          <Link
            href={
              usuario.atletaId
                ? "/portal-atleta"
                : "/portal-atleta/dados"
            }
            className="flex items-center gap-3"
          >

            <img
              src="/branding/escudo.png"
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

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">

              <div className="text-sm font-bold text-[#08265a]">
                {nome}
              </div>

              <div className="text-xs text-slate-500">
                Atleta
              </div>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#08265a] text-sm font-bold text-white">
              {iniciais(nome)}
            </div>

            <form action={sair}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Sair
              </button>
            </form>

          </div>

        </div>

      </header>

      <nav className="bg-[#08265a] shadow-sm">

        <div className="mx-auto flex max-w-[1500px] items-center overflow-x-auto px-6">

          {usuario.atletaId && (
            <Menu
              href="/portal-atleta"
              texto="Resumo"
            />
          )}

          <Menu
            href="/portal-atleta/dados"
            texto="Meus Dados"
          />

          {usuario.atletaId && (
            <>
              <Menu
                href="/portal-atleta/documentos"
                texto="Documentos"
              />

              <Menu
                href="/portal-atleta/termo"
                texto="Termo"
              />

              <Menu
                href="/portal-atleta/desempenho"
                texto="Desempenho"
              />

              <Menu
                href="/portal-atleta/historico"
                texto="Histórico"
              />

              <Menu
                href="/portal-atleta/notificacoes"
                texto="Notificações"
              />
            </>
          )}

        </div>

      </nav>

      <main className="mx-auto max-w-[1500px] p-6 lg:p-8">
        {children}
      </main>

    </div>
  );
}

function Menu({
  href,
  texto,
}: {
  href: string;
  texto: string;
}) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {texto}
    </Link>
  );
}

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) =>
      parte
        .charAt(0)
        .toUpperCase()
    )
    .join("");
}