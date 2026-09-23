"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  createClient,
} from "@/lib/supabase/client";

export default function PedidoLojaNotificacao() {

  const [
    quantidade,
    setQuantidade,
  ] = useState(0);


  async function consultar() {

    const supabase =
      createClient();

    const {
      count,
      error,
    } = await supabase
      .from("loja_pedidos")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .is(
        "visualizado_em",
        null
      );


    if (!error) {
      setQuantidade(
        count ?? 0
      );
    }
  }


  useEffect(() => {

    consultar();

    const timer =
      window.setInterval(
        consultar,
        20000
      );


    return () =>
      window.clearInterval(
        timer
      );

  }, []);


  return (
    <Link
      href="/admin/loja/pedidos"
      className="pedido-notificacao"
      title={
        quantidade > 0
          ? `${quantidade} novo(s) pedido(s)`
          : "Pedidos da Loja"
      }
    >
      <span className="pedido-icone">
        🔔
      </span>

      {quantidade > 0 && (
        <strong>
          {quantidade > 99
            ? "99+"
            : quantidade}
        </strong>
      )}

      <style jsx>{`

        .pedido-notificacao {
          position: relative;

          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #f0f4f8;

          color: #082e69;

          text-decoration: none;
        }


        .pedido-icone {
          font-size: 15px;
        }


        strong {
          position: absolute;

          right: -4px;
          top: -5px;

          min-width: 17px;
          height: 17px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding:
            0 4px;

          border-radius: 999px;

          background: #dc3038;
          color: white;

          font-size: 7px;

          box-shadow:
            0 2px 6px
            rgba(
              0,
              0,
              0,
              .16
            );
        }

      `}</style>
    </Link>
  );
}