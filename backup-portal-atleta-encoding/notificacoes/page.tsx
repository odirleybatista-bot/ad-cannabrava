"use client";

import { useMemo, useState } from "react";

type Notificacao = {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  tipo: "info" | "sucesso" | "alerta";
  lida: boolean;
};

const notificacoesIniciais: Notificacao[] = [
  {
    id: 1,
    titulo: "DocumentaÃ§Ã£o aprovada",
    mensagem:
      "Seus documentos foram analisados e aprovados pela A.D. Cannabrava.",
    data: "30/08/2026",
    tipo: "sucesso",
    lida: false,
  },
  {
    id: 2,
    titulo: "Termo disponÃ­vel",
    mensagem:
      "Seu Termo de Compromisso estÃ¡ disponÃ­vel para leitura e assinatura.",
    data: "29/08/2026",
    tipo: "info",
    lida: false,
  },
  {
    id: 3,
    titulo: "Cadastro atualizado",
    mensagem:
      "As informaÃ§Ãµes do seu cadastro foram atualizadas com sucesso.",
    data: "28/08/2026",
    tipo: "sucesso",
    lida: true,
  },
  {
    id: 4,
    titulo: "ConvocaÃ§Ã£o",
    mensagem:
      "VocÃª foi incluÃ­do em uma nova convocaÃ§Ã£o. Consulte os detalhes da partida.",
    data: "27/08/2026",
    tipo: "alerta",
    lida: true,
  },
];

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] =
    useState<Notificacao[]>(notificacoesIniciais);

  const naoLidas = useMemo(
    () => notificacoes.filter((item) => !item.lida).length,
    [notificacoes]
  );

  function marcarComoLida(id: number) {
    setNotificacoes((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              lida: true,
            }
          : item
      )
    );
  }

  function marcarTodas() {
    setNotificacoes((atuais) =>
      atuais.map((item) => ({
        ...item,
        lida: true,
      }))
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#08265a]">
            NotificaÃ§Ãµes
          </h1>

          <p className="mt-1 text-slate-500">
            Acompanhe avisos importantes da A.D. Cannabrava.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              NÃ£o lidas
            </p>

            <p className="text-xl font-black text-[#08265a]">
              {naoLidas}
            </p>
          </div>

          {naoLidas > 0 && (
            <button
              type="button"
              onClick={marcarTodas}
              className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {notificacoes.map((notificacao) => (
          <article
            key={notificacao.id}
            className={`rounded-2xl border bg-white p-6 transition ${
              notificacao.lida
                ? "border-slate-200"
                : "border-blue-200 shadow-sm"
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

              <div className="flex min-w-0 gap-4">

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                    notificacao.tipo === "sucesso"
                      ? "bg-emerald-100 text-emerald-700"
                      : notificacao.tipo === "alerta"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {notificacao.tipo === "sucesso"
                    ? "âœ“"
                    : notificacao.tipo === "alerta"
                    ? "!"
                    : "i"}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-bold text-[#08265a]">
                      {notificacao.titulo}
                    </h2>

                    {!notificacao.lida && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                        Nova
                      </span>
                    )}
                  </div>

                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                    {notificacao.mensagem}
                  </p>

                  <p className="mt-3 text-xs font-medium text-slate-400">
                    {notificacao.data}
                  </p>
                </div>

              </div>

              {!notificacao.lida && (
                <button
                  type="button"
                  onClick={() => marcarComoLida(notificacao.id)}
                  className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Marcar como lida
                </button>
              )}

            </div>
          </article>
        ))}
      </div>

      {notificacoes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-600">
            Nenhuma notificaÃ§Ã£o
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Novos avisos aparecerÃ£o aqui.
          </p>
        </div>
      )}

    </div>
  );
}