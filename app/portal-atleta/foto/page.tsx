import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import Foto3x4Client from "./Foto3x4Client";

export default async function FotoAtletaPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  if (!usuario.atletaId) {
    redirect("/portal-atleta/dados");
  }

  const supabase = await createClient();

  const { data: atleta } = await supabase
    .from("atletas")
    .select(`
      id,
      nome,
      status
    `)
    .eq("id", usuario.atletaId)
    .maybeSingle();

  if (!atleta) {
    redirect("/portal-atleta/dados");
  }

  const { data: foto } = await supabase
    .from("atleta_documentos")
    .select(`
      id,
      nome_arquivo,
      caminho_arquivo,
      status
    `)
    .eq("atleta_id", atleta.id)
    .eq("tipo", "foto_3x4")
    .maybeSingle();

  let fotoUrl: string | null = null;

  if (foto?.caminho_arquivo) {
    const { data } = await supabase.storage
      .from("atleta-documentos")
      .createSignedUrl(
        foto.caminho_arquivo,
        60 * 60
      );

    fotoUrl = data?.signedUrl || null;
  }

  return (
    <Foto3x4Client
      atletaId={atleta.id}
      nome={atleta.nome}
      fotoUrl={fotoUrl}
      statusFoto={foto?.status || null}
      nomeArquivo={foto?.nome_arquivo || null}
    />
  );
}