"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function valor(
  formData: FormData,
  nome: string
) {
  const campo = formData.get(nome);

  return typeof campo === "string"
    ? campo.trim()
    : "";
}

function nullSeVazio(
  valorRecebido: string
) {
  return valorRecebido === ""
    ? null
    : valorRecebido;
}

export async function criarPartida(
  formData: FormData
) {
  const supabase =
    await createClient();

  const tipo =
    valor(formData, "tipo");

  const adversario =
    valor(formData, "adversario");

  const modalidade =
    valor(formData, "modalidade");

  const temporada =
    valor(formData, "temporada");

  const competicaoId =
    valor(formData, "competicao_id");

  const rodada =
    valor(formData, "rodada");

  const fase =
    valor(formData, "fase");

  const grupo =
    valor(formData, "grupo");

  const dataJogo =
    valor(formData, "data_jogo");

  const horario =
    valor(formData, "horario");

  const local =
    valor(formData, "local");

  const cidade =
    valor(formData, "cidade");

  const mando =
    valor(formData, "mando");

  const observacoes =
    valor(formData, "observacoes");

  if (!tipo) {
    throw new Error(
      "Informe o tipo da partida."
    );
  }

  if (!adversario) {
    throw new Error(
      "Informe o adversário."
    );
  }

  if (!modalidade) {
    throw new Error(
      "Informe a modalidade."
    );
  }

  if (!dataJogo) {
    throw new Error(
      "Informe a data da partida."
    );
  }

  if (!mando) {
    throw new Error(
      "Informe o mando de campo."
    );
  }

  if (
    tipo === "oficial" &&
    !competicaoId
  ) {
    throw new Error(
      "Jogo oficial precisa estar vinculado a uma competição."
    );
  }

  const {
    data: usuarioId,
  } =
    await supabase.rpc(
      "usuario_id_atual"
    );

  const {
    data: partida,
    error,
  } =
    await supabase
      .from("partidas")
      .insert({
        competicao_id:
          nullSeVazio(
            competicaoId
          ),

        tipo,

        adversario,

        modalidade,

        temporada:
          nullSeVazio(
            temporada
          ),

        rodada:
          nullSeVazio(
            rodada
          ),

        fase:
          nullSeVazio(
            fase
          ),

        grupo:
          nullSeVazio(
            grupo
          ),

        data_jogo:
          dataJogo,

        horario:
          nullSeVazio(
            horario
          ),

        local:
          nullSeVazio(
            local
          ),

        cidade:
          nullSeVazio(
            cidade
          ),

        mando,

        status:
          "agendada",

        observacoes:
          nullSeVazio(
            observacoes
          ),

        criado_por:
          usuarioId || null,
      })
      .select("id")
      .single();

  if (
    error ||
    !partida
  ) {
    console.error(
      "Erro ao criar partida:",
      error
    );

    throw new Error(
      error?.message ||
        "Não foi possível cadastrar a partida."
    );
  }

  revalidatePath(
    "/admin/esportivo/partidas"
  );

  redirect(
    `/admin/esportivo/partidas/${partida.id}`
  );
}