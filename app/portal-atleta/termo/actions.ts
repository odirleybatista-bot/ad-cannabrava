"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function assinarTermo(
  atletaId: string,
  termoId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      sucesso: false,
      mensagem: "Sua sessão expirou.",
    };
  }

  const { data: atleta } = await supabase
    .from("atletas")
    .select("id")
    .eq("id", atletaId)
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!atleta) {
    return {
      sucesso: false,
      mensagem: "Atleta não autorizado.",
    };
  }

  const { error } = await supabase.rpc(
    "assinar_termo_atleta",
    {
      p_termo_id: termoId,
    }
  );

  if (error) {
    console.error(
      "Erro ao assinar termo:",
      error
    );

    return {
      sucesso: false,
      mensagem: error.message,
    };
  }

  revalidatePath("/portal-atleta");
  revalidatePath("/portal-atleta/termo");
  revalidatePath("/portal-atleta/historico");
  revalidatePath("/admin/esportivo/atletas");
  revalidatePath(
    `/admin/esportivo/atletas/${atletaId}`
  );

  return {
    sucesso: true,
  };
}