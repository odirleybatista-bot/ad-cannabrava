"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { assinarTermo } from "./actions";

type Termo = {
  id: string;
  atleta_id: string;
  vinculo_id: string | null;
  versao: string;
  titulo: string;
  conteudo: string;
  status: string;
  gerado_em: string | null;
  liberado_em: string | null;
  assinado_em: string | null;
  aceite: boolean;
};

export default function TermoClient({ atletaId }: { atletaId: string }) {
  

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [termo, setTermo] =
    useState<Termo | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [concordo, setConcordo] =
    useState(false);

  const [assinando, setAssinando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  useEffect(() => {
    async function carregar() {
      if (!atletaId) {
        setErro(
          "Não foi possível identificar o atleta."
        );

        setCarregando(false);
        return;
      }

      const { data, error } =
        await supabase
          .from("termos_compromisso")
          .select(`
            id,
            atleta_id,
            vinculo_id,
            versao,
            titulo,
            conteudo,
            status,
            gerado_em,
            liberado_em,
            assinado_em,
            aceite
          `)
          .eq(
            "atleta_id",
            atletaId
          )
          .order(
            "criado_em",
            {
              ascending: false,
            }
          )
          .limit(1)
          .maybeSingle();

      if (error) {
        console.error(
          "Erro ao carregar termo:",
          error
        );

        setErro(
          "Não foi possível carregar o termo."
        );
      } else {
        setTermo(
          data as Termo | null
        );
      }

      setCarregando(false);
    }

    carregar();
  }, [
    atletaId,
    supabase,
  ]);

  async function assinar() {
    if (
      !atletaId ||
      !termo
    ) {
      return;
    }

    if (!concordo) {
      setErro(
        "Marque a declaração de concordância antes de assinar."
      );

      return;
    }

    setErro("");
    setMensagem("");
    setAssinando(true);

    try {
      const resultado =
        await assinarTermo(
          atletaId,
          termo.id
        );

      if (
        !resultado.sucesso
      ) {
        setErro(
          resultado.mensagem ||
            "Não foi possível assinar o termo."
        );

        return;
      }

      const agora =
        new Date().toISOString();

      setTermo({
        ...termo,
        status: "assinado",
        aceite: true,
        assinado_em: agora,
      });

      setMensagem(
        "Termo assinado com sucesso. Seu vínculo esportivo está ativo."
      );

    } catch (error) {
      console.error(
        "Erro inesperado:",
        error
      );

      setErro(
        "Ocorreu um erro durante a assinatura."
      );

    } finally {
      setAssinando(false);
    }
  }

  if (carregando) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold text-slate-600">
          Carregando termo...
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-3xl font-black text-[#08265a]">
          Termo de Compromisso
        </h1>

        <p className="mt-1 text-slate-500">
          Consulte e acompanhe seu Termo de Compromisso com a Associação Desportiva Cannabrava.
        </p>

      </div>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {mensagem}
        </div>
      )}

      {!atletaId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">

          <h2 className="font-bold text-amber-900">
            Cadastro não identificado
          </h2>

          <p className="mt-2 text-sm text-amber-800">
            Acesse novamente seu cadastro para continuar.
          </p>

        </div>
      )}

      {atletaId &&
        !termo && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl">
              📄
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#08265a]">
              Termo ainda não disponível
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              O Termo de Compromisso será disponibilizado depois da aprovação dos documentos e da definição do vínculo esportivo.
            </p>

          </div>
        )}

      {termo && (
        <>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">

            <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Documento
                </p>

                <h2 className="mt-1 text-xl font-black text-[#08265a]">
                  {termo.titulo}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Versão {termo.versao}
                </p>
              </div>

              <StatusTermo
                status={
                  termo.status
                }
              />

            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">

              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {termo.conteudo}
              </div>

            </div>

          </section>

          {termo.status ===
            "gerado" && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">

              <h2 className="font-bold text-[#08265a]">
                Aguardando liberação
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                O termo já foi gerado, mas ainda precisa ser liberado pela administração para assinatura.
              </p>

            </div>
          )}

          {termo.status ===
            "aguardando_assinatura" && (
            <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">

              <h2 className="text-lg font-bold text-[#08265a]">
                Assinatura eletrônica
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Leia integralmente o termo acima. Para concluir, confirme sua concordância e registre o aceite eletrônico.
              </p>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-white p-4">

                <input
                  type="checkbox"
                  checked={concordo}
                  onChange={(
                    event
                  ) =>
                    setConcordo(
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 h-5 w-5"
                />

                <span className="text-sm font-medium leading-6 text-slate-700">
                  Declaro que li o Termo de Compromisso, compreendi seu conteúdo e concordo com as condições apresentadas.
                </span>

              </label>

              <div className="mt-5 flex justify-end">

                <button
                  type="button"
                  disabled={
                    !concordo ||
                    assinando
                  }
                  onClick={assinar}
                  className="h-12 rounded-xl bg-[#08265a] px-7 text-sm font-bold text-white transition hover:bg-[#0b3478] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {assinando
                    ? "Registrando assinatura..."
                    : "Assinar eletronicamente"}
                </button>

              </div>

            </section>
          )}

          {termo.status ===
            "assinado" && (
            <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-emerald-800">
                    Termo assinado
                  </h2>

                  <p className="mt-1 text-sm text-emerald-700">
                    Seu aceite eletrônico foi registrado com sucesso.
                  </p>

                </div>

                {termo.assinado_em && (
                  <div className="rounded-xl bg-white px-5 py-3">

                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Assinado em
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {formatarDataHora(
                        termo.assinado_em
                      )}
                    </p>

                  </div>
                )}

              </div>

            </section>
          )}

        </>
      )}

    </div>
  );
}

function StatusTermo({
  status,
}: {
  status: string;
}) {
  const mapa: Record<
    string,
    {
      texto: string;
      classe: string;
    }
  > = {
    rascunho: {
      texto: "Rascunho",
      classe:
        "bg-slate-100 text-slate-600",
    },

    gerado: {
      texto: "Gerado",
      classe:
        "bg-blue-100 text-blue-700",
    },

    aguardando_assinatura: {
      texto:
        "Aguardando assinatura",
      classe:
        "bg-amber-100 text-amber-800",
    },

    assinado: {
      texto: "Assinado",
      classe:
        "bg-emerald-100 text-emerald-700",
    },

    cancelado: {
      texto: "Cancelado",
      classe:
        "bg-red-100 text-red-700",
    },
  };

  const atual =
    mapa[status] || {
      texto: status,
      classe:
        "bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${atual.classe}`}
    >
      {atual.texto}
    </span>
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
  ).format(
    new Date(data)
  );
}