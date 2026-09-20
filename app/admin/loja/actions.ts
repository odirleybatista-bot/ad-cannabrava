"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "loja-cannabrava";

function texto(valor: FormDataEntryValue | null) {
  return String(valor ?? "").trim();
}

function slugificar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extensaoImagem(file: File) {
  const nome = file.name.toLowerCase();

  if (nome.endsWith(".png")) return "png";
  if (nome.endsWith(".jpg")) return "jpg";
  if (nome.endsWith(".jpeg")) return "jpeg";
  if (nome.endsWith(".webp")) return "webp";

  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpeg";
  if (file.type === "image/webp") return "webp";

  throw new Error("Formato de imagem não permitido.");
}

async function uploadImagem(
  produtoId: string,
  ordem: number,
  file: File
) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo precisa ser uma imagem.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Cada imagem deve ter no máximo 5 MB.");
  }

  const supabase = await createClient();

  const extensao = extensaoImagem(file);

  const caminho =
    `produtos/${produtoId}/imagem-${ordem}.${extensao}`;

  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(
      caminho,
      bytes,
      {
        contentType: file.type,
        upsert: true,
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(caminho);

  return data.publicUrl;
}


export async function cadastrarProduto(
  formData: FormData
) {
  const nome = texto(formData.get("nome"));
  const descricao = texto(formData.get("descricao"));

  const preco = Number(
    texto(formData.get("preco")).replace(",", ".")
  );

  const precoPromocionalTexto =
    texto(formData.get("preco_promocional"));

  const precoPromocional =
    precoPromocionalTexto
      ? Number(precoPromocionalTexto.replace(",", "."))
      : null;

  const estoque = Number(
    formData.get("estoque") || 0
  );

  const categoriaId =
    texto(formData.get("categoria_id")) || null;

  const sku =
    texto(formData.get("sku")) || null;

  const destaque =
    formData.get("destaque") === "on";

  const permiteEncomenda =
    formData.get("permite_encomenda") === "on";

  if (!nome) {
    throw new Error("Informe o nome do produto.");
  }

  if (!descricao) {
    throw new Error("Informe a descrição do produto.");
  }

  if (!Number.isFinite(preco) || preco < 0) {
    throw new Error("Informe um preço válido.");
  }

  const supabase = await createClient();

  const baseSlug = slugificar(nome);

  let slug = baseSlug;
  let contador = 1;

  while (true) {
    const { data: existente } = await supabase
      .from("loja_produtos")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existente) break;

    contador += 1;
    slug = `${baseSlug}-${contador}`;
  }

  const {
    data: produto,
    error,
  } = await supabase
    .from("loja_produtos")
    .insert({
      nome,
      slug,
      descricao,
      preco,
      preco_promocional: precoPromocional,
      estoque:
        Number.isFinite(estoque)
          ? estoque
          : 0,
      permite_encomenda:
        permiteEncomenda,
      destaque,
      categoria_id:
        categoriaId,
      sku,
      ativo: true,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  for (let ordem = 1; ordem <= 4; ordem++) {
    const file = formData.get(`imagem_${ordem}`);

    if (
      file instanceof File &&
      file.size > 0
    ) {
      const url = await uploadImagem(
        produto.id,
        ordem,
        file
      );

      if (url) {
        await supabase
          .from("loja_produto_imagens")
          .upsert(
            {
              produto_id: produto.id,
              imagem_url: url,
              ordem,
            },
            {
              onConflict: "produto_id,ordem",
            }
          );
      }
    }
  }

  revalidatePath("/admin/loja");
  revalidatePath("/portalcannabrava/loja");
}


export async function adicionarCor(
  formData: FormData
) {
  const produtoId =
    texto(formData.get("produto_id"));

  const cor =
    texto(formData.get("cor"));

  const estoque = Number(
    formData.get("estoque") || 0
  );

  if (!produtoId || !cor) {
    throw new Error("Informe a cor.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("loja_produto_cores")
    .upsert(
      {
        produto_id: produtoId,
        cor,
        estoque:
          Number.isFinite(estoque)
            ? estoque
            : 0,
        ativo: true,
      },
      {
        onConflict: "produto_id,cor",
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/loja");
  revalidatePath("/portalcannabrava/loja");
}


export async function alternarProduto(
  formData: FormData
) {
  const produtoId =
    texto(formData.get("produto_id"));

  const ativo =
    texto(formData.get("ativo")) === "true";

  const supabase = await createClient();

  const { error } = await supabase
    .from("loja_produtos")
    .update({
      ativo: !ativo,
    })
    .eq("id", produtoId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/loja");
  revalidatePath("/portalcannabrava/loja");
}