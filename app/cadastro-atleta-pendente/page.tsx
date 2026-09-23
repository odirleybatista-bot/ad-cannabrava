import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { sair } from "@/app/login/actions";

export default async function CadastroAtletaPendentePage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  if (usuario.atletaId) {
    redirect("/portal-atleta");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">

      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

        <img
          src="/branding/escudo.png"
          alt="A.D. Cannabrava"
          className="mx-auto h-20 w-20 object-contain"
        />

        <h1 className="mt-5 text-2xl font-black text-[#08265a]">
          Cadastro de atleta não vinculado
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          Seu usuário está autenticado, mas ainda não possui um cadastro de atleta vinculado.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          A administração deverá concluir o vínculo antes da liberação do Portal do Atleta.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Usuário identificado
          </p>

          <p className="mt-1 font-bold text-slate-700">
            {usuario.nome || usuario.email}
          </p>

        </div>

        <form
          action={sair}
          className="mt-6"
        >
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#08265a] px-6 text-sm font-bold text-white"
          >
            Sair
          </button>
        </form>

      </div>

    </main>
  );
}