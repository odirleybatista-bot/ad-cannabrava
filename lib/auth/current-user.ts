import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  authId: string;
  usuarioId: string | null;
  email: string | null;
  nome: string | null;
  perfis: string[];
  atletaId: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const {
    data: acesso,
    error: acessoError,
  } =
    await supabase.rpc(
      "meu_acesso"
    );

  if (acessoError) {
    console.error(
      "Erro meu_acesso:",
      acessoError
    );

    return null;
  }

  return {
    authId: user.id,

    usuarioId:
      acesso?.usuario_id ||
      null,

    nome:
      acesso?.nome ||
      user.user_metadata?.nome ||
      user.email ||
      null,

    email:
      acesso?.email ||
      user.email ||
      null,

    perfis:
      Array.isArray(
        acesso?.perfis
      )
        ? acesso.perfis
        : [],

    atletaId:
      acesso?.atleta_id ||
      null,
  };
}

export function possuiPerfil(
  usuario: CurrentUser,
  permitidos: string[]
) {
  const normalizar = (
    texto: string
  ) =>
    texto
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();

  const atuais =
    usuario.perfis.map(
      normalizar
    );

  return permitidos
    .map(normalizar)
    .some(
      (perfil) =>
        atuais.includes(perfil)
    );
}