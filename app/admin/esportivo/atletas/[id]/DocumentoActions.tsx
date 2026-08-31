"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { atualizarStatusDocumento } from "./actions";

type Props = {
  atletaId: string;
  documentoId: string;
  caminhoArquivo: string;
  status: string;
};

export default function DocumentoActions({
  atletaId,
  documentoId,
  caminhoArquivo,
  status,
}: Props) {
  const [processando, setProcessando] =
    useState(false);

  const [observacao, setObservacao] =
    useState("");

  const [mostrarCorrecao, setMostrarCorrecao] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  async function visualizar() {
    const supabase = createClient();

    const { data, error } =
      await supabase.storage
        .from("atleta-documentos")
        .createSignedUrl(
          caminhoArquivo,
          60
        );

    if (error || !data?.signedUrl) {
      setMensagem(
        "Não foi possível abrir o documento."
      );
      return;
    }

    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function aprovar() {
    setProcessando(true);
    setMensagem("");

    const resultado =
      await atualizarStatusDocumento(
        atletaId,
        documentoId,
        "aprovado"
      );

    setProcessando(false);

    if (!resultado.sucesso) {
      setMensagem(
        resultado.mensagem ||
          "Não foi possível aprovar."
      );
      return;
    }

    setMensagem(
      "Documento aprovado com sucesso."
    );
  }

  async function solicitarCorrecao() {
    if (!observacao.trim()) {
      setMensagem(
        "Informe o motivo da correção."
      );
      return;
    }

    setProcessando(true);
    setMensagem("");

    const resultado =
      await atualizarStatusDocumento(
        atletaId,
        documentoId,
        "correcao_solicitada",
        observacao
      );

    setProcessando(false);

    if (!resultado.sucesso) {
      setMensagem(
        resultado.mensagem ||
          "Não foi possível solicitar correção."
      );
      return;
    }

    setMostrarCorrecao(false);

    setMensagem(
      "Correção solicitada ao atleta."
    );
  }

  return (
    <div className="w-full md:w-auto">

      <div className="flex flex-wrap gap-2">

        <button
          type="button"
          onClick={visualizar}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Visualizar
        </button>

        {status !== "aprovado" && (
          <button
            type="button"
            disabled={processando}
            onClick={aprovar}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Aprovar
          </button>
        )}

        {status !==
          "correcao_solicitada" && (
          <button
            type="button"
            onClick={() =>
              setMostrarCorrecao(
                !mostrarCorrecao
              )
            }
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600"
          >
            Solicitar correção
          </button>
        )}

      </div>

      {mostrarCorrecao && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

          <label className="mb-2 block text-sm font-bold text-amber-900">
            Motivo da correção
          </label>

          <textarea
            value={observacao}
            onChange={(event) =>
              setObservacao(
                event.target.value
              )
            }
            rows={3}
            placeholder="Ex.: documento ilegível, página incompleta..."
            className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm outline-none"
          />

          <div className="mt-3 flex justify-end gap-2">

            <button
              type="button"
              onClick={() =>
                setMostrarCorrecao(false)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={processando}
              onClick={solicitarCorrecao}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Confirmar correção
            </button>

          </div>

        </div>
      )}

      {mensagem && (
        <p className="mt-3 text-sm font-medium text-slate-600">
          {mensagem}
        </p>
      )}

    </div>
  );
}