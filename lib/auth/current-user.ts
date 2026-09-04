import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  authId: string;
  usuarioId: string | null;
  nome: string;
  email: string;
  perfis: string[];
  atletaId: string | null;
};

function normalizarPerfis(valor: unknown): string[] {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor
      .map((item) => {
        if (typeof item === "string") return item;

        if (
          item &&
          typeof item === "object" &&
          "nome" in item
        ) {
          return String(
            (item as { nome?: unknown }).nome || ""
          );
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof valor === "string") {
    return [valor];
  }

  return [];
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: acesso, error: acessoError } =
    await supabase.rpc("meu_acesso");

  if (acessoError) {
    console.error(
      "Erro ao consultar meu_acesso:",
      acessoError
    );
  }

  /*
    A função RPC pode retornar um objeto
    ou um array dependendo da forma como
    foi criada no PostgreSQL.
  */
  const dados = Array.isArray(acesso)
    ? acesso[0]
    : acesso;

  let usuarioId: string | null =
    dados?.usuario_id || null;

  let nome =
    dados?.nome ||
    user.user_metadata?.nome ||
    user.email?.split("@")[0] ||
    "Usuário";

  let email =
    dados?.email ||
    user.email ||
    "";

  let perfis =
    normalizarPerfis(
      dados?.perfis
    );

  /*
    Se a RPC não retornar o usuário interno,
    procuramos diretamente em public.usuarios
    usando auth_user_id.
  */
  if (!usuarioId) {
    const { data: usuario } =
      await supabase
        .from("usuarios")
        .select("id,nome,email")
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();

    if (usuario) {
      usuarioId =
        usuario.id;

      nome =
        usuario.nome ||
        nome;

      email =
        usuario.email ||
        email;
    }
  }

  /*
    Busca o perfil diretamente caso a RPC
    não o tenha retornado.
  */
  if (
    usuarioId &&
    perfis.length === 0
  ) {
    const { data: perfisUsuario } =
      await supabase
        .from("usuario_perfis")
        .select(`
          perfis (
            nome
          )
        `)
        .eq(
          "usuario_id",
          usuarioId
        );

    perfis =
      (
        perfisUsuario || []
      )
        .map((item: any) =>
          item?.perfis?.nome
        )
        .filter(Boolean);
  }

  /*
    PONTO PRINCIPAL DA CORREÇÃO:

    Não dependemos mais exclusivamente
    do atleta_id retornado por meu_acesso().

    Sempre verificamos a tabela atletas
    pelo ID INTERNO do usuário.
  */
  let atletaId: string | null =
    dados?.atleta_id || null;

  if (usuarioId) {
    const { data: atleta, error: atletaError } =
      await supabase
        .from("atletas")
        .select("id")
        .eq(
          "usuario_id",
          usuarioId
        )
        .order(
          "criado_em",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

    if (atletaError) {
      console.error(
        "Erro ao localizar atleta do usuário:",
        atletaError
      );
    }

    if (atleta?.id) {
      atletaId =
        atleta.id;
    }
  }

  return {
    authId:
      user.id,

    usuarioId,

    nome,

    email,

    perfis,

    atletaId,
  };
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const usuario =
    await getCurrentUser();

  if (!usuario) {
    redirect(
      "/login"
    );
  }

  return usuario;
}
export function possuiPerfil(
  usuario: CurrentUser | null,
  perfisPermitidos: string[]
): boolean {
  if (!usuario) {
    return false;
  }

  const perfisUsuario = usuario.perfis.map(
    (perfil) =>
      perfil
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
  );

  const permitidos = perfisPermitidos.map(
    (perfil) =>
      perfil
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
  );

  return perfisUsuario.some(
    (perfil) => permitidos.includes(perfil)
  );
}