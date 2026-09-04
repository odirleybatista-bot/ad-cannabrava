import { createClient } from "@/lib/supabase/server";
import DocumentacaoCompletaClient from "./DocumentacaoCompletaClient";

export default async function DocumentacaoCompletaPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("atletas")
    .select(`
      id,
      nome,
      apelido,
      cpf,
      modalidade,
      posicao,
      status,
      atleta_documentos (
        tipo,
        status
      )
    `)
    .order("nome", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Erro ao carregar atletas:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );
  }

  return (
    <DocumentacaoCompletaClient
      atletas={data || []}
    />
  );
}