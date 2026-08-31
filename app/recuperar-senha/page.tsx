import Link from "next/link";
import { recuperarSenha } from "./actions";

type Props = {
  searchParams: Promise<{
    enviado?: string;
    erro?: string;
  }>;
};

export default async function RecuperarSenhaPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-black text-[#08265a]">
          Recuperar senha
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Informe o e-mail utilizado no sistema.
        </p>

        {params.enviado && (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Enviamos um link de recuperação para o seu e-mail.
          </div>
        )}

        {params.erro && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Não foi possível enviar o e-mail de recuperação.
          </div>
        )}

        <form action={recuperarSenha} className="mt-7">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            E-mail
          </label>

          <input
            name="email"
            type="email"
            required
            placeholder="seuemail@email.com"
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
          />

          <button
            type="submit"
            className="mt-5 h-14 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700"
          >
            Enviar link de recuperação
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-blue-700"
        >
          ← Voltar para o login
        </Link>

      </div>
    </main>
  );
}