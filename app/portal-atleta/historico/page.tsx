import { requireCurrentAthlete } from "@/lib/auth/current-athlete";
import { createClient } from "@/lib/supabase/server";

type Evento = {
  titulo: string;
  descricao: string;
  data: string;
  tipo: "concluido" | "atencao";
};

export default async function HistoricoPage() {
  const { atletaId } =
    await requireCurrentAthlete();

  const supabase = await createClient();

  const { data: atleta } =
    await supabase
      .from("atletas")
      .select(`
        nome,
        status,
        criado_em,
        atualizado_em
      `)
      .eq("id", atletaId)
      .single();

  const { data: documentos } =
    await supabase
      .from("atleta_documentos")
      .select(`
        tipo,
        status,
        enviado_em,
        analisado_em,
        observacao
      `)
      .eq("atleta_id", atletaId);

  const { data: vinculos } =
    await supabase
      .from("atleta_vinculos")
      .select(`
        modalidade,
        temporada,
        status,
        criado_em
      `)
      .eq("atleta_id", atletaId);

  const { data: termos } =
    await supabase
      .from("termos_compromisso")
      .select(`
        status,
        gerado_em,
        liberado_em,
        assinado_em,
        criado_em
      `)
      .eq("atleta_id", atletaId);

  const eventos: Evento[] = [];

  if (atleta) {
    eventos.push({
      titulo: "Pré-cadastro realizado",
      descricao:
        "Cadastro do atleta registrado no sistema.",
      data: atleta.criado_em,
      tipo: "concluido",
    });
  }

  documentos?.forEach(
    (documento) => {
      eventos.push({
        titulo:
          `${nomeDocumento(documento.tipo)} enviado`,
        descricao:
          "Documento encaminhado para análise.",
        data:
          documento.enviado_em,
        tipo: "concluido",
      });

      if (
        documento.status ===
          "aprovado" &&
        documento.analisado_em
      ) {
        eventos.push({
          titulo:
            `${nomeDocumento(documento.tipo)} aprovado`,
          descricao:
            "Documento aprovado pela administração.",
          data:
            documento.analisado_em,
          tipo: "concluido",
        });
      }

      if (
        documento.status ===
          "correcao_solicitada" &&
        documento.analisado_em
      ) {
        eventos.push({
          titulo:
            "Correção documental solicitada",
          descricao:
            documento.observacao ||
            "A administração solicitou uma nova versão do documento.",
          data:
            documento.analisado_em,
          tipo: "atencao",
        });
      }
    }
  );

  vinculos?.forEach(
    (vinculo) => {
      eventos.push({
        titulo:
          "Vínculo esportivo criado",
        descricao:
          `${vinculo.modalidade} • Temporada ${vinculo.temporada}`,
        data:
          vinculo.criado_em,
        tipo: "concluido",
      });
    }
  );

  termos?.forEach((termo) => {
    if (termo.gerado_em) {
      eventos.push({
        titulo:
          "Termo de Compromisso gerado",
        descricao:
          "Documento criado pela administração.",
        data:
          termo.gerado_em,
        tipo: "concluido",
      });
    }

    if (termo.liberado_em) {
      eventos.push({
        titulo:
          "Termo liberado para assinatura",
        descricao:
          "O documento ficou disponível no Portal do Atleta.",
        data:
          termo.liberado_em,
        tipo: "concluido",
      });
    }

    if (termo.assinado_em) {
      eventos.push({
        titulo:
          "Termo assinado",
        descricao:
          "Aceite eletrônico registrado. Atleta ativo.",
        data:
          termo.assinado_em,
        tipo: "concluido",
      });
    }
  });

  eventos.sort(
    (a, b) =>
      new Date(b.data).getTime() -
      new Date(a.data).getTime()
  );

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-3xl font-black text-[#08265a]">
          Histórico
        </h1>

        <p className="mt-1 text-slate-500">
          Acompanhe os acontecimentos relacionados ao seu cadastro.
        </p>

      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">

        {eventos.length === 0 ? (
          <p className="py-10 text-center text-slate-500">
            Nenhum histórico disponível.
          </p>
        ) : (
          <div className="space-y-6">

            {eventos.map(
              (evento, index) => (
                <div
                  key={`${evento.titulo}-${evento.data}-${index}`}
                  className="flex gap-4"
                >
                  <div
                    className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${
                      evento.tipo ===
                      "atencao"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {evento.tipo ===
                    "atencao"
                      ? "!"
                      : "✓"}
                  </div>

                  <div className="flex-1 border-b border-slate-100 pb-6">

                    <div className="flex flex-wrap justify-between gap-2">

                      <h2 className="font-bold text-slate-800">
                        {evento.titulo}
                      </h2>

                      <span className="text-xs text-slate-400">
                        {formatarDataHora(
                          evento.data
                        )}
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {evento.descricao}
                    </p>

                  </div>
                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

function nomeDocumento(tipo: string) {
  const mapa: Record<string, string> = {
    identidade:
      "Documento de Identidade",
    residencia:
      "Comprovante de Residência",
    eleitoral:
      "Certidão de Quitação Eleitoral",
  };

  return mapa[tipo] || tipo;
}

function formatarDataHora(data: string) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(data));
}