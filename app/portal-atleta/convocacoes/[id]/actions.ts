"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function responderConvocacao(
  convocacaoId: string,
  resposta: "confirmado" | "indisponivel",
  formData: FormData
) {
  const usuario = await getCurrentUser();

  if (!usuario?.atletaId) {
    throw new Error(
      "Atleta não identificado."
    );
  }

  if (
    resposta !== "confirmado" &&
    resposta !== "indisponivel"
  ) {
    throw new Error(
      "Resposta inválida."
    );
  }

  const supabase =
    await createClient();

  const {
    data: convocacao,
    error: erroConvocacao,
  } =
    await supabase
      .from("convocacoes")
      .select(`
        id,
        status,
        limite_confirmacao
      `)
      .eq("id", convocacaoId)
      .maybeSingle();

  if (
    erroConvocacao ||
    !convocacao
  ) {
    throw new Error(
      "Convocação não encontrada."
    );
  }

  if (
    convocacao.status !== "aberta"
  ) {
    throw new Error(
      "Esta convocação não está aberta para respostas."
    );
  }

  if (
    convocacao.limite_confirmacao &&
    new Date(
      convocacao.limite_confirmacao
    ).getTime() < Date.now()
  ) {
    throw new Error(
      "O prazo para confirmação já terminou."
    );
  }

  const {
    data: registro,
    error: erroRegistro,
  } =
    await supabase
      .from(
        "convocacao_atletas"
      )
      .select(`
        id,
        resposta
      `)
      .eq(
        "convocacao_id",
        convocacaoId
      )
      .eq(
        "atleta_id",
        usuario.atletaId
      )
      .maybeSingle();

  if (
    erroRegistro ||
    !registro
  ) {
    throw new Error(
      "Você não está relacionado nesta convocação."
    );
  }

  if (
    registro.resposta !== "pendente"
  ) {
    throw new Error(
      "Sua resposta para esta convocação já foi registrada."
    );
  }

  const observacao =
    String(
      formData.get(
        "observacao_atleta"
      ) || ""
    ).trim();

  const { error } =
    await supabase
      .from(
        "convocacao_atletas"
      )
      .update({
        resposta,
        resposta_em:
          new Date().toISOString(),
        observacao_atleta:
          observacao || null,
      })
      .eq("id", registro.id)
      .eq(
        "atleta_id",
        usuario.atletaId
      )
      .eq(
        "resposta",
        "pendente"
      );

  if (error) {
    console.error(
      "Erro ao responder convocação:",
      error
    );

    throw new Error(
      error.message ||
        "Não foi possível registrar sua resposta."
    );
  }

  revalidatePath(
    `/portal-atleta/convocacoes/${convocacaoId}`
  );

  revalidatePath(
    "/portal-atleta/convocacoes"
  );

  revalidatePath(
    "/portal-atleta"
  );
}