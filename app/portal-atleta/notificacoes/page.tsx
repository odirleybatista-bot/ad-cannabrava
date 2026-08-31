import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  marcarNotificacaoLida,
  marcarTodasLidas,
} from "./actions";

export default async function NotificacoesPage() {
  const usuario =
    await getCurrentUser();

  if (!usuario) {
    return null;
  }

  const supabase =
    await createClient();

  const { data: notificacoes } =
    await supabase
      .from("notificacoes")
      .select("*")
      .order("criado_em", {
        ascending: false,
      });

  const lista =
    notificacoes || [];

  const naoLidas =
    lista.filter(
      (item) => !item.lida
    ).length;

  return (
    <div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

        <div>
          <h1 className="text-3xl font-black text-[#08265a]">
            Notificações
          </h1>

          <p className="mt-1 text-slate-500">
            Avisos e atualizações sobre seu cadastro.
          </p>
        </div>

        {naoLidas > 0 && (
          <form action={marcarTodasLidas}>

            <button
              type="submit"
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Marcar todas como lidas
            </button>

          </form>
        )}

      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

          <h2 className="font-bold text-[#08265a]">
            Nenhuma notificação
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Quando houver alguma atualização importante ela aparecerá aqui.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {lista.map(
            (notificacao) => (
              <article
                key={notificacao.id}
                className={`rounded-2xl border p-5 ${
                  notificacao.lida
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="font-bold text-[#08265a]">
                        {notificacao.titulo}
                      </h2>

                      {!notificacao.lida && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                          Nova
                        </span>
                      )}

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {notificacao.mensagem}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      {formatarDataHora(
                        notificacao.criado_em
                      )}
                    </p>

                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">

                    {notificacao.link && (
                      <Link
                        href={
                          notificacao.link
                        }
                        className="rounded-lg bg-[#08265a] px-4 py-2 text-sm font-bold text-white"
                      >
                        Visualizar
                      </Link>
                    )}

                    {!notificacao.lida && (
                      <form
                        action={marcarNotificacaoLida.bind(
                          null,
                          notificacao.id
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
                        >
                          Marcar como lida
                        </button>
                      </form>
                    )}

                  </div>

                </div>

              </article>
            )
          )}

        </div>
      )}

    </div>
  );
}

function formatarDataHora(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(data));
}