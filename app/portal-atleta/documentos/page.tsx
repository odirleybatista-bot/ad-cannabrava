import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import DocumentosClient from "./DocumentosClient";

export default async function DocumentosPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  if (!usuario.atletaId) {
    redirect("/portal-atleta/dados");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("atleta_documentos")
    .select("*")
    .eq("atleta_id", usuario.atletaId);

  if (error) {
    console.error(
      "Erro ao carregar documentos:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );
  }

  const documentos = await Promise.all(
    (data || []).map(async (documento: any) => {
      const caminhoArquivo =
        documento.caminho_arquivo ||
        documento.path ||
        documento.arquivo_path ||
        null;

      const nomeArquivo =
        documento.nome_arquivo ||
        documento.nome ||
        (
          caminhoArquivo
            ? caminhoArquivo
                .split("/")
                .pop()
            : null
        );

      let urlAssinada: string | null = null;

      if (
        documento.tipo === "foto_3x4" &&
        caminhoArquivo
      ) {
        const {
          data: assinatura,
          error: erroAssinatura,
        } = await supabase.storage
          .from("atleta-documentos")
          .createSignedUrl(
            caminhoArquivo,
            3600
          );

        if (!erroAssinatura) {
          urlAssinada =
            assinatura?.signedUrl || null;
        }
      }

      return {
        id: documento.id,
        tipo: documento.tipo,
        status:
          documento.status || "pendente",
        observacao:
          documento.observacao || null,

        nome_arquivo:
          nomeArquivo,

        caminho_arquivo:
          caminhoArquivo,

        url_assinada:
          urlAssinada,
      };
    })
  );

  return (
    <DocumentosClient
      atletaId={usuario.atletaId}
      documentos={documentos}
    />
  );
}