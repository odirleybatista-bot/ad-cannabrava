import Link from "next/link";
import { redefinirSenha } from "./actions";

type Props = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function RedefinirSenhaPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const mensagens: Record<string, string> = {
    "senha-curta": "A senha deve possuir pelo menos 6 caracteres.",
    "senhas-diferentes": "As senhas informadas não são iguais.",
    sessao: "O link de recuperação expirou ou não é válido.",
    atualizacao: "Não foi possível alterar a senha.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-black text-[#08265a]">
          Criar nova senha
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Informe a nova senha que será utilizada para acessar o sistema.
        </p>

        {params.erro && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mensagens[params.erro] || "Não foi possível alterar a senha."}
          </div>
        )}

        <form action={redefinirSenha} className="mt-7">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nova senha
          </label>

          <input
            name="senha"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Digite a nova senha"
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
          />

          <label className="mb-2 mt-5 block text-sm font-semibold text-slate-700">
            Confirmar nova senha
          </label>

          <input
            name="confirmarSenha"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Digite novamente"
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
          />

          <button
            type="submit"
            className="mt-6 h-14 w-full rounded-xl bg-blue-600 font-bold text-white transition hover:bg-blue-700"
          >
            Alterar senha
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-blue-700"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}