"use client";

import { useState } from "react";
import Link from "next/link";
import { entrar } from "./actions";

export default function LoginPage() {
  const [erro, setErro] =
    useState("");

  const [entrando, setEntrando] =
    useState(false);

  async function login(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setEntrando(true);

    try {
      const resultado =
        await entrar(
          new FormData(
            event.currentTarget
          )
        );

      if (
        resultado &&
        !resultado.sucesso
      ) {
        setErro(
          resultado.mensagem ||
            "Não foi possível entrar."
        );
      }
    } finally {
      setEntrando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">

        <div
          className="hidden bg-cover bg-center lg:block"
          style={{
            backgroundImage:
              "url('/login-background.png')",
          }}
        />

        <div className="flex items-center justify-center bg-white px-6 py-12">

          <div className="w-full max-w-md">

            <div className="mb-8">

              <img
                src="/escudo.png"
                alt="A.D. Cannabrava"
                className="h-20 w-20 object-contain"
              />

              <h1 className="mt-5 text-3xl font-black text-[#08265a]">
                A.D. CANNABRAVA
              </h1>

              <p className="mt-2 text-slate-500">
                Área de acesso ao sistema
              </p>

            </div>

            {erro && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {erro}
              </div>
            )}

            <form
              onSubmit={login}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  E-mail
                </label>

                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Senha
                </label>

                <input
                  name="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Digite sua senha"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />
              </div>

              <button
                type="submit"
                disabled={entrando}
                className="h-12 w-full rounded-xl bg-[#08265a] text-sm font-bold text-white transition hover:bg-[#0b3478] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {entrando
                  ? "Entrando..."
                  : "Entrar"}
              </button>

            </form>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">

              <p className="text-sm font-semibold text-slate-700">
                Ainda não possui acesso?
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Atletas podem criar o próprio acesso ao portal.
              </p>

              <Link
                href="/cadastro"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-[#08265a] px-5 text-sm font-bold text-[#08265a] transition hover:bg-blue-100"
              >
                Criar meu acesso
              </Link>

            </div>
            <div className="mt-7 border-t border-slate-200 pt-6 text-center">

              <p className="text-xs leading-5 text-slate-400">
                Associação Desportiva Cannabrava
                <br />
                Sistema Oficial de Gestão
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}