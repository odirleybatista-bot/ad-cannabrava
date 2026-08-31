"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function marcarNotificacaoLida(
  notificacaoId: string
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("notificacoes")
    .update({
      lida: true,
      lida_em:
        new Date().toISOString(),
    })
    .eq("id", notificacaoId)
    .eq("usuario_id", user.id);

  revalidatePath(
    "/portal-atleta/notificacoes"
  );

  revalidatePath(
    "/portal-atleta"
  );
}

export async function marcarTodasLidas() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("notificacoes")
    .update({
      lida: true,
      lida_em:
        new Date().toISOString(),
    })
    .eq("usuario_id", user.id)
    .eq("lida", false);

  revalidatePath(
    "/portal-atleta/notificacoes"
  );

  revalidatePath(
    "/portal-atleta"
  );
}