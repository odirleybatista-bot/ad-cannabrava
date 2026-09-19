"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function texto(
  formData: FormData,
  nome: string
) {
  const valor = formData.get(nome);

  return typeof valor === "string"
    ? valor.trim()
    : "";
}

function inteiroOuNull(
  valor: string
) {
  if (!valor) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? Math.trunc(numero)
    : null;
}

export async function salvarEscalacao(
  partidaId: string,
  sumulaId: string,
  formData: FormData
) {
  const supabase =
    await createClient();

  const {
    data: sumula,
  } =
    await supabase
      .from("sumulas")
      .select("status")
      .eq("id", sumulaId)
      .maybeSingle();

  if (!sumula) {
    throw new Error(
      "Súmula não encontrada."
    );
  }

  if (
    sumula.status ===
    "finalizada"
  ) {
    throw new Error(
      "A súmula já foi finalizada."
    );
  }

  const atletaIds =
    formData
      .getAll("atleta_id")
      .map((item) =>
        String(item)
      )
      .filter(Boolean);

  const registros =
    atletaIds.map(
      (atletaId) => {
        const situacao =
          texto(
            formData,
            `situacao_${atletaId}`
          ) || "nao_utilizado";

        const numeroCamisa =
          inteiroOuNull(
            texto(
              formData,
              `numero_${atletaId}`
            )
          );

        const posicao =
          texto(
            formData,
            `posicao_${atletaId}`
          );

        const capitao =
          formData.get(
            `capitao_${atletaId}`
          ) === "on";

        const goleiro =
          formData.get(
            `goleiro_${atletaId}`
          ) === "on";

        return {
          sumula_id:
            sumulaId,

          atleta_id:
            atletaId,

          situacao,

          numero_camisa:
            numeroCamisa,

          posicao:
            posicao || null,

          capitao,

          goleiro,
        };
      }
    );

  const {
    error: erroExcluir,
  } =
    await supabase
      .from("sumula_atletas")
      .delete()
      .eq(
        "sumula_id",
        sumulaId
      );

  if (erroExcluir) {
    console.error(
      "Erro ao limpar escalação:",
      erroExcluir
    );

    throw new Error(
      erroExcluir.message
    );
  }

  if (
    registros.length > 0
  ) {
    const {
      error: erroInserir,
    } =
      await supabase
        .from(
          "sumula_atletas"
        )
        .insert(registros);

    if (erroInserir) {
      console.error(
        "Erro ao salvar escalação:",
        erroInserir
      );

      throw new Error(
        erroInserir.message
      );
    }
  }

  await supabase
    .from("sumulas")
    .update({
      status:
        "em_preenchimento",
      atualizado_em:
        new Date().toISOString(),
    })
    .eq(
      "id",
      sumulaId
    );

  const {
    error: erroRecalculo,
  } = await supabase.rpc(
    "recalcular_participacao_sumula",
    {
      p_sumula_id:
        sumulaId,
    }
  );

  if (erroRecalculo) {
    console.error(
      "Erro ao recalcular participação:",
      erroRecalculo
    );

    throw new Error(
      erroRecalculo.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/sumula`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );
}

export async function salvarDadosSumula(
  partidaId: string,
  sumulaId: string,
  formData: FormData
) {
  const supabase =
    await createClient();

  const golsCannabrava =
    Math.max(
      0,
      inteiroOuNull(
        texto(
          formData,
          "gols_cannabrava"
        )
      ) ?? 0
    );

  const golsAdversario =
    Math.max(
      0,
      inteiroOuNull(
        texto(
          formData,
          "gols_adversario"
        )
      ) ?? 0
    );

  const publico =
    inteiroOuNull(
      texto(
        formData,
        "publico"
      )
    );

  const acrescimoPrimeiro =
    inteiroOuNull(
      texto(
        formData,
        "acrescimo_primeiro_tempo"
      )
    );

  const acrescimoSegundo =
    inteiroOuNull(
      texto(
        formData,
        "acrescimo_segundo_tempo"
      )
    );

  const observacoes =
    texto(
      formData,
      "observacoes"
    );

  const rendaTexto =
    texto(
      formData,
      "renda"
    )
      .replace(/\./g, "")
      .replace(",", ".");

  const renda =
    rendaTexto
      ? Number(rendaTexto)
      : null;

  const {
    data: sumula,
  } =
    await supabase
      .from("sumulas")
      .select("status")
      .eq("id", sumulaId)
      .maybeSingle();

  if (!sumula) {
    throw new Error(
      "Súmula não encontrada."
    );
  }

  if (
    sumula.status ===
    "finalizada"
  ) {
    throw new Error(
      "A súmula já foi finalizada."
    );
  }

  const { error } =
    await supabase
      .from("sumulas")
      .update({
        gols_cannabrava:
          golsCannabrava,

        gols_adversario:
          golsAdversario,

        publico:
          publico === null
            ? null
            : Math.max(
                0,
                publico
              ),

        renda:
          renda !== null &&
          Number.isFinite(renda)
            ? Math.max(
                0,
                renda
              )
            : null,

        acrescimo_primeiro_tempo:
          acrescimoPrimeiro,

        acrescimo_segundo_tempo:
          acrescimoSegundo,

        observacoes:
          observacoes || null,

        status:
          "em_preenchimento",

        atualizado_em:
          new Date().toISOString(),
      })
      .eq(
        "id",
        sumulaId
      );

  if (error) {
    console.error(
      "Erro ao salvar súmula:",
      error
    );

    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/sumula`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );
}

export async function finalizarSumulaAction(
  partidaId: string,
  sumulaId: string
) {
  const supabase =
    await createClient();

  const {
    count: titulares,
    error: erroTitulares,
  } =
    await supabase
      .from("sumula_atletas")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "sumula_id",
        sumulaId
      )
      .eq(
        "situacao",
        "titular"
      );

  if (erroTitulares) {
    throw new Error(
      erroTitulares.message
    );
  }

  if (!titulares) {
    throw new Error(
      "Defina pelo menos um atleta titular antes de finalizar a súmula."
    );
  }

  const {
    data: sumula,
    error: erroSumula,
  } =
    await supabase
      .from("sumulas")
      .select(`
        gols_cannabrava,
        gols_adversario
      `)
      .eq(
        "id",
        sumulaId
      )
      .maybeSingle();

  if (
    erroSumula ||
    !sumula
  ) {
    throw new Error(
      "Súmula não encontrada."
    );
  }

  const {
    data: eventosGol,
    error: erroEventos,
  } =
    await supabase
      .from("sumula_eventos")
      .select("id,tipo")
      .eq(
        "sumula_id",
        sumulaId
      )
      .eq(
        "equipe",
        "cannabrava"
      )
      .in(
        "tipo",
        [
          "gol",
          "penalti_convertido",
        ]
      );

  if (erroEventos) {
    throw new Error(
      erroEventos.message
    );
  }

  const golsRegistrados =
    eventosGol?.length || 0;

  if (
    golsRegistrados !==
    sumula.gols_cannabrava
  ) {
    throw new Error(
      `O placar informa ${sumula.gols_cannabrava} gol(s) da Cannabrava, mas existem ${golsRegistrados} gol(s) registrados nos eventos. Corrija antes de finalizar.`
    );
  }

  const {
    error,
  } =
    await supabase.rpc(
      "finalizar_sumula",
      {
        p_sumula_id:
          sumulaId,
      }
    );

  if (error) {
    console.error(
      "Erro ao finalizar súmula:",
      error
    );

    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/sumula`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );

  revalidatePath(
    "/admin/esportivo/partidas"
  );

  revalidatePath(
    "/admin/esportivo/estatisticas"
  );
}