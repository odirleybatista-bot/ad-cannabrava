"use client";

import { useState } from "react";

export default function TermoPage() {
  const [aceito, setAceito] = useState(false);
  const [assinado, setAssinado] = useState(false);

  function assinar() {
    if (!aceito) return;

    setAssinado(true);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#08265a]">
          Termo de Compromisso
        </h1>

        <p className="mt-1 text-slate-500">
          Leia atentamente o termo antes de confirmar sua assinatura.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">

        <section className="rounded-2xl border border-slate-200 bg-white p-6">

          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-black text-[#08265a]">
              A.D. CANNABRAVA
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AssociaÃ§Ã£o Desportiva Cannabrava
            </p>
          </div>

          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">

            <p>
              O presente Termo de Compromisso estabelece as condiÃ§Ãµes de
              participaÃ§Ã£o do atleta nas atividades esportivas promovidas
              pela A.D. Cannabrava.
            </p>

            <div>
              <h3 className="font-bold text-[#08265a]">
                1. Compromisso esportivo
              </h3>

              <p className="mt-1">
                O atleta compromete-se a participar das atividades,
                competiÃ§Ãµes, partidas, reuniÃµes e demais aÃ§Ãµes para as quais
                for regularmente convocado, observadas as condiÃ§Ãµes
                estabelecidas pela associaÃ§Ã£o.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#08265a]">
                2. Conduta e disciplina
              </h3>

              <p className="mt-1">
                O atleta deverÃ¡ manter comportamento compatÃ­vel com os
                princÃ­pios da associaÃ§Ã£o, respeitando dirigentes, comissÃ£o
                tÃ©cnica, companheiros, adversÃ¡rios e demais participantes.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#08265a]">
                3. Uso de imagem
              </h3>

              <p className="mt-1">
                O uso da imagem do atleta em materiais institucionais,
                esportivos e de divulgaÃ§Ã£o serÃ¡ realizado nos limites
                definidos pela associaÃ§Ã£o e pelas autorizaÃ§Ãµes aplicÃ¡veis.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#08265a]">
                4. Responsabilidade
              </h3>

              <p className="mt-1">
                O atleta declara que as informaÃ§Ãµes e documentos fornecidos
                sÃ£o verdadeiros e compromete-se a comunicar qualquer alteraÃ§Ã£o
                relevante em seu cadastro.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#08265a]">
                5. VigÃªncia
              </h3>

              <p className="mt-1">
                O vÃ­nculo terÃ¡ vigÃªncia conforme a temporada, modalidade e
                perÃ­odo definidos pela A.D. Cannabrava.
              </p>
            </div>

          </div>

        </section>

        <aside className="space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              SituaÃ§Ã£o
            </p>

            <p
              className={`mt-2 text-xl font-black ${
                assinado
                  ? "text-emerald-600"
                  : "text-amber-600"
              }`}
            >
              {assinado
                ? "Termo assinado"
                : "Aguardando assinatura"}
            </p>
          </div>

          {!assinado && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={aceito}
                  onChange={(event) =>
                    setAceito(event.target.checked)
                  }
                  className="mt-1 h-5 w-5"
                />

                <span className="text-sm leading-6 text-slate-700">
                  Declaro que li e estou de acordo com o Termo de
                  Compromisso da A.D. Cannabrava.
                </span>
              </label>

              <button
                type="button"
                disabled={!aceito}
                onClick={assinar}
                className="mt-6 h-12 w-full rounded-xl bg-[#08265a] px-5 text-sm font-bold text-white transition hover:bg-[#0b3478] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Assinar termo
              </button>

            </div>
          )}

          {assinado && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="font-bold text-emerald-800">
                Assinatura registrada
              </h3>

              <p className="mt-2 text-sm leading-6 text-emerald-700">
                Seu aceite foi registrado com sucesso.
              </p>
            </div>
          )}

        </aside>

      </div>
    </div>
  );
}