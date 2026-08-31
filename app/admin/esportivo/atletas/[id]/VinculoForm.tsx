"use client";

import { useState } from "react";
import { salvarVinculo } from "./actions";

type Props = {
  atletaId: string;
  statusAtleta: string;
  modalidadeAtual?: string | null;
};

export default function VinculoForm({
  atletaId,
  statusAtleta,
  modalidadeAtual,
}: Props) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const permitido = [
    "aprovado",
    "vinculado",
    "termo_liberado",
    "ativo",
  ].includes(statusAtleta);

  async function salvar(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const resultado = await salvarVinculo(
        atletaId,
        new FormData(event.currentTarget)
      );

      if (!resultado.sucesso) {
        setErro(
          resultado.mensagem ||
            "Não foi possível salvar o vínculo."
        );
        return;
      }

      setSucesso("Vínculo salvo com sucesso.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar}>
      {!permitido && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          A definição do vínculo será liberada após a aprovação de todos os documentos obrigatórios.
        </div>
      )}

      {erro && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {sucesso}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Modalidade
          </label>

          <select
            name="modalidade"
            disabled={!permitido}
            defaultValue={modalidadeAtual || "Futebol"}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm disabled:bg-slate-100"
          >
            <option value="Futebol">Futebol</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Temporada
          </label>

          <select
            name="temporada"
            disabled={!permitido}
            defaultValue="2026"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm disabled:bg-slate-100"
          >
            <option value="2026">2026</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Data inicial
          </label>

          <input
            name="data_inicio"
            type="date"
            disabled={!permitido}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Data final
          </label>

          <input
            name="data_fim"
            type="date"
            disabled={!permitido}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm disabled:bg-slate-100"
          />
        </div>

      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={!permitido || salvando}
          className="h-11 rounded-xl bg-[#08265a] px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {salvando
            ? "Salvando..."
            : "Salvar vínculo"}
        </button>
      </div>
    </form>
  );
}