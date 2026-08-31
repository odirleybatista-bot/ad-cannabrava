"use client";

import Link from "next/link";
import { useState } from "react";
import { criarAcesso } from "./actions";

export default function CadastroPage() {
  const [erro, setErro] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  async function cadastrar(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      const resultado =
        await criarAcesso(
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
            "Não foi possível criar seu acesso."
        );

        return;
      }

      if (
        resultado?.confirmarEmail
      ) {
        setMensagem(
          resultado.mensagem ||
            "Cadastro realizado."
        );
      }

    } finally {
      setSalvando(false);
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

            <img
              src="/escudo.png"
              alt="A.D. Cannabrava"
              className="h-20 w-20 object-contain"
            />

            <h1 className="mt-5 text-3xl font-black text-[#08265a]">
              Criar meu acesso
            </h1>

            <p className="mt-2 text-slate-500">
              Portal do Atleta
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Crie seu acesso para iniciar seu cadastro como atleta da Associação Desportiva Cannabrava.
            </p>

            {erro && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                {mensagem}

                <Link
                  href="/login"
                  className="mt-4 block font-bold underline"
                >
                  Ir para o login
                </Link>
              </div>
            )}

            <form
              onSubmit={cadastrar}
              className="mt-7 space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Nome completo
                </label>

                <input
                  name="nome"
                  required
                  placeholder="Seu nome completo"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  E-mail
                </label>

                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seuemail@exemplo.com"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Senha
                </label>

                <input
                  name="senha"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Confirmar senha
                </label>

                <input
                  name="confirmar_senha"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Digite novamente"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="h-12 w-full rounded-xl bg-[#08265a] font-bold text-white transition hover:bg-[#0b3478] disabled:opacity-50"
              >
                {salvando
                  ? "Criando acesso..."
                  : "Criar meu acesso"}
              </button>

            </form>

            <div className="mt-7 border-t border-slate-200 pt-6 text-center">

              <p className="text-sm text-slate-500">
                Já possui acesso?
              </p>

              <Link
                href="/login"
                className="mt-2 inline-block font-bold text-[#08265a] hover:underline"
              >
                Entrar no Portal
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}