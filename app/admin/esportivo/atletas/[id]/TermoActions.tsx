"use client";

import { useState } from "react";
import {
  gerarTermo,
  liberarTermo,
} from "./actions";

type Props = {
  atletaId: string;
  statusAtleta: string;
  termoId?: string | null;
  termoStatus?: string | null;
};

export default function TermoActions({
  atletaId,
  statusAtleta,
  termoId,
  termoStatus,
}: Props) {
  const [processando, setProcessando] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  const podeGerar = [
    "vinculado",
    "termo_liberado",
    "ativo",
  ].includes(statusAtleta);

  async function gerar() {
    setProcessando(true);
    setMensagem("");

    try {
      const resultado =
        await gerarTermo(
          atletaId
        );

      if (!resultado.sucesso) {
        setMensagem(
          resultado.mensagem ||
            "Não foi possível gerar o termo."
        );

        return;
      }

      setMensagem(
        "Termo gerado com sucesso."
      );
    } finally {
      setProcessando(false);
    }
  }

  async function liberar() {
    if (!termoId) {
      return;
    }

    setProcessando(true);
    setMensagem("");

    try {
      const resultado =
        await liberarTermo(
          atletaId,
          termoId
        );

      if (!resultado.sucesso) {
        setMensagem(
          resultado.mensagem ||
            "Não foi possível liberar o termo."
        );

        return;
      }

      setMensagem(
        "Termo liberado para assinatura."
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div>

      <div className="flex flex-wrap gap-3">

        {!termoId && (
          <button
            type="button"
            onClick={gerar}
            disabled={
              !podeGerar ||
              processando
            }
            className="h-11 rounded-xl bg-[#08265a] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {processando
              ? "Gerando..."
              : "Gerar termo"}
          </button>
        )}

        {termoId &&
          termoStatus ===
            "gerado" && (
            <>
              <button
                type="button"
                onClick={gerar}
                disabled={processando}
                className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700"
              >
                Gerar novamente
              </button>

              <button
                type="button"
                onClick={liberar}
                disabled={processando}
                className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-40"
              >
                Liberar para assinatura
              </button>
            </>
          )}

        {termoStatus ===
          "aguardando_assinatura" && (
          <div className="rounded-xl bg-amber-100 px-5 py-3 text-sm font-bold text-amber-800">
            Aguardando assinatura do atleta
          </div>
        )}

        {termoStatus ===
          "assinado" && (
          <div className="rounded-xl bg-emerald-100 px-5 py-3 text-sm font-bold text-emerald-700">
            Termo assinado
          </div>
        )}

      </div>

      {!podeGerar &&
        !termoId && (
          <p className="mt-3 text-sm text-slate-500">
            O termo será liberado após a criação do vínculo esportivo.
          </p>
        )}

      {mensagem && (
        <p className="mt-3 text-sm font-semibold text-slate-600">
          {mensagem}
        </p>
      )}

    </div>
  );
}