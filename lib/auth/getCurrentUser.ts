import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select(`
      id,
      nome,
      email,
      ativo,
      usuario_perfis (
        perfis (
          id,
          nome
        )
      )
    `)
    .eq("auth_user_id", user.id)
    .single();

  if (!usuario) {
    return null;
  }

  return {
    authUser: user,
    usuario,
  };
}