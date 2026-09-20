"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarStatusPedido(
  formData: FormData
) {
  const pedidoId =
    String(
      formData.get("pedido_id") ?? ""
    ).trim();

  const status =
    String(
      formData.get("status") ?? ""
    ).trim();

  const permitidos = [
    "novo",
    "em_atendimento",
    "confirmado",
    "entregue",
    "cancelado",
  ];

  if (!pedidoId) {
    throw new Error(
      "Pedido não identificado."
    );
  }

  if (!permitidos.includes(status)) {
    throw new Error(
      "Status inválido."
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from("loja_pedidos")
      .update({
        status,
        atualizado_em:
          new Date().toISOString(),
      })
      .eq("id", pedidoId);

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    "/admin/loja/pedidos"
  );
}


export async function marcarPedidoVisualizado(
  formData: FormData
) {
  const pedidoId =
    String(
      formData.get("pedido_id") ?? ""
    ).trim();

  if (!pedidoId) {
    return;
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.rpc(
      "visualizar_pedido_loja",
      {
        p_pedido_id:
          pedidoId,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    "/admin/loja/pedidos"
  );
}