import {
  atualizarStatusPedido,
  marcarPedidoVisualizado,
} from "./actions";

import { createClient } from "@/lib/supabase/server";

function moeda(valor: number) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor ?? 0);
}

function dataHora(valor: string) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Bahia",
    }
  ).format(
    new Date(valor)
  );
}

function nomeStatus(status: string) {

  const nomes:
    Record<string,string> = {
      novo: "Novo",
      em_atendimento:
        "Em atendimento",
      confirmado:
        "Confirmado",
      entregue:
        "Entregue",
      cancelado:
        "Cancelado",
    };

  return nomes[status]
    ?? status;
}

export default async function PedidosLojaPage() {

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("loja_pedidos")
    .select(`
      id,
      numero,
      cliente_nome,
      cliente_telefone,
      cliente_endereco,
      observacoes,
      total_estimado,
      total,
      status,
      visualizado_em,
      criado_em,
      atualizado_em,

      itens:loja_pedido_itens (
        id,
        produto_id,
        produto_nome,
        cor,
        quantidade,
        valor_unitario,
        valor_total,
        tipo
      )
    `)
    .order(
      "criado_em",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "Erro ao carregar pedidos:",
      {
        message:
          error.message,
        code:
          error.code,
        details:
          error.details,
      }
    );
  }

  const pedidos =
    data ?? [];

  const novos =
    pedidos.filter(
      (pedido: any) =>
        !pedido.visualizado_em
    ).length;

  const emAtendimento =
    pedidos.filter(
      (pedido: any) =>
        pedido.status ===
        "em_atendimento"
    ).length;

  return (
    <main className="pagina">

      <header className="cabecalho">

        <div>

          <span>
            LOJA CANNABRAVA
          </span>

          <h1>
            Pedidos
          </h1>

          <p>
            Reservas e encomendas
            recebidas pelo Portal
            Cannabrava.
          </p>

        </div>

      </header>


      <section className="indicadores">

        <article>

          <span>
            NOVOS
          </span>

          <strong>
            {novos}
          </strong>

        </article>


        <article>

          <span>
            EM ATENDIMENTO
          </span>

          <strong>
            {emAtendimento}
          </strong>

        </article>


        <article>

          <span>
            TOTAL
          </span>

          <strong>
            {pedidos.length}
          </strong>

        </article>

      </section>


      <section className="lista">

        {pedidos.length === 0 ? (

          <div className="vazio">
            Nenhum pedido recebido
            até o momento.
          </div>

        ) : (

          pedidos.map(
            (pedido: any) => {

              const novo =
                !pedido.visualizado_em;

              return (

                <article
                  key={pedido.id}
                  className={
                    novo
                      ? "pedido novo"
                      : "pedido"
                  }
                >

                  <div className="pedido-topo">

                    <div>

                      <div className="numero">

                        Pedido #

                        {String(
                          pedido.numero
                        ).padStart(
                          5,
                          "0"
                        )}

                        {novo && (
                          <span>
                            NOVO
                          </span>
                        )}

                      </div>

                      <small>
                        {dataHora(
                          pedido.criado_em
                        )}
                      </small>

                    </div>


                    <span
                      className={
                        `status status-${pedido.status}`
                      }
                    >
                      {nomeStatus(
                        pedido.status
                      )}
                    </span>

                  </div>


                  <div className="cliente">

                    <div>

                      <span>
                        CLIENTE
                      </span>

                      <strong>
                        {pedido.cliente_nome}
                      </strong>

                    </div>


                    <div>

                      <span>
                        TELEFONE
                      </span>

                      <strong>
                        {
                          pedido.cliente_telefone
                        }
                      </strong>

                    </div>


                    <div className="endereco">

                      <span>
                        ENDEREÇO
                      </span>

                      <strong>
                        {
                          pedido.cliente_endereco
                        }
                      </strong>

                    </div>

                  </div>


                  <div className="itens">

                    <div className="itens-titulo">

                      <span>
                        ITENS DO PEDIDO
                      </span>

                      <strong>
                        {
                          pedido.itens?.length
                          ?? 0
                        } item(ns)
                      </strong>

                    </div>


                    {(pedido.itens ?? [])
                      .map(
                        (item: any) => (

                          <div
                            key={item.id}
                            className="item"
                          >

                            <div>

                              <strong>
                                {
                                  item.produto_nome
                                }
                              </strong>

                              <span>
                                {item.cor
                                  ? `Cor: ${item.cor}`
                                  : "Sem variação"}
                              </span>

                            </div>


                            <div className="tipo">

                              <span
                                className={
                                  item.tipo ===
                                  "reserva"
                                    ? "reserva"
                                    : "encomenda"
                                }
                              >
                                {
                                  item.tipo ===
                                  "reserva"
                                    ? "Reserva"
                                    : "Encomenda"
                                }
                              </span>

                            </div>


                            <div className="quantidade">

                              {item.quantidade}
                              {" "}un.

                            </div>


                            <div className="valor">

                              {moeda(
                                Number(
                                  item.valor_total
                                )
                              )}

                            </div>

                          </div>

                        )
                      )}

                  </div>


                  {pedido.observacoes && (

                    <div className="observacoes">

                      <span>
                        OBSERVAÇÕES
                      </span>

                      <p>
                        {
                          pedido.observacoes
                        }
                      </p>

                    </div>

                  )}


                  <div className="pedido-rodape">

                    <div className="total">

                      <span>
                        Valor estimado
                      </span>

                      <strong>
                        {moeda(
                          Number(
                            pedido.total_estimado
                            ??
                            pedido.total
                            ??
                            0
                          )
                        )}
                      </strong>

                    </div>


                    <div className="acoes">

                      {novo && (

                        <form
                          action={
                            marcarPedidoVisualizado
                          }
                        >

                          <input
                            type="hidden"
                            name="pedido_id"
                            value={pedido.id}
                          />

                          <button
                            className="visualizar"
                          >
                            Marcar como visualizado
                          </button>

                        </form>

                      )}


                      <form
                        action={
                          atualizarStatusPedido
                        }
                        className="status-form"
                      >

                        <input
                          type="hidden"
                          name="pedido_id"
                          value={pedido.id}
                        />

                        <select
                          name="status"
                          defaultValue={
                            pedido.status
                          }
                        >

                          <option value="novo">
                            Novo
                          </option>

                          <option value="em_atendimento">
                            Em atendimento
                          </option>

                          <option value="confirmado">
                            Confirmado
                          </option>

                          <option value="entregue">
                            Entregue
                          </option>

                          <option value="cancelado">
                            Cancelado
                          </option>

                        </select>

                        <button>
                          Atualizar
                        </button>

                      </form>

                    </div>

                  </div>

                </article>

              );
            }
          )

        )}

      </section>


      <style>{`

        * {
          box-sizing:
            border-box;
        }

        .pagina {
          min-height: 100vh;

          padding:
            25px
            clamp(
              14px,
              3vw,
              42px
            )
            60px;

          background: #f4f7fb;
        }


        .cabecalho span {
          color: #16894c;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
        }


        .cabecalho h1 {
          margin: 4px 0;

          color: #082e69;

          font-size: 32px;
        }


        .cabecalho p {
          margin: 0;

          color: #718096;

          font-size: 10px;
        }


        .indicadores {
          display: grid;

          grid-template-columns:
            repeat(3,1fr);

          gap: 12px;

          margin-top: 18px;
        }


        .indicadores article {
          padding: 17px;

          border:
            1px solid #dfe6ee;

          border-radius: 11px;

          background: white;
        }


        .indicadores span {
          display: block;

          color: #708095;

          font-size: 7px;
          font-weight: 900;
        }


        .indicadores strong {
          display: block;

          margin-top: 5px;

          color: #082e69;

          font-size: 25px;
        }


        .lista {
          display: grid;

          gap: 14px;

          margin-top: 15px;
        }


        .pedido {
          overflow: hidden;

          border:
            1px solid #dce4ed;

          border-radius: 13px;

          background: white;
        }


        .pedido.novo {
          border-left:
            5px solid #16894c;

          box-shadow:
            0 6px 20px
            rgba(
              22,
              137,
              76,
              .08
            );
        }


        .pedido-topo {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 12px;

          padding: 14px 16px;

          border-bottom:
            1px solid #edf1f5;
        }


        .numero {
          color: #082e69;

          font-size: 14px;
          font-weight: 900;
        }


        .numero > span {
          display: inline-block;

          margin-left: 7px;

          padding:
            3px 6px;

          border-radius: 999px;

          background: #16894c;

          color: white;

          font-size: 6px;
        }


        .pedido-topo small {
          display: block;

          margin-top: 3px;

          color: #8290a2;

          font-size: 7px;
        }


        .status {
          padding:
            5px 8px;

          border-radius: 999px;

          font-size: 7px;
          font-weight: 900;
        }


        .status-novo {
          background: #e8f6ed;
          color: #147440;
        }


        .status-em_atendimento {
          background: #e9f2fc;
          color: #145e9c;
        }


        .status-confirmado {
          background: #e8f6ed;
          color: #147440;
        }


        .status-entregue {
          background: #e7efff;
          color: #274c9b;
        }


        .status-cancelado {
          background: #fdeced;
          color: #ac3038;
        }


        .cliente {
          display: grid;

          grid-template-columns:
            1.2fr
            1fr
            2fr;

          gap: 14px;

          padding: 15px 16px;
        }


        .cliente span,
        .observacoes > span {
          display: block;

          color: #8793a3;

          font-size: 6px;
          font-weight: 900;
        }


        .cliente strong {
          display: block;

          margin-top: 4px;

          color: #24374f;

          font-size: 9px;
        }


        .itens {
          margin:
            0 16px;

          border:
            1px solid #e4eaf1;

          border-radius: 9px;

          overflow: hidden;
        }


        .itens-titulo {
          display: flex;

          justify-content:
            space-between;

          gap: 10px;

          padding:
            9px 11px;

          background: #f5f8fb;
        }


        .itens-titulo span {
          color: #718096;

          font-size: 7px;
          font-weight: 900;
        }


        .itens-titulo strong {
          color: #082e69;

          font-size: 8px;
        }


        .item {
          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            95px
            65px
            95px;

          align-items: center;

          gap: 8px;

          padding:
            10px 11px;

          border-top:
            1px solid #edf1f5;
        }


        .item strong {
          display: block;

          color: #22364e;

          font-size: 9px;
        }


        .item > div > span {
          display: block;

          margin-top: 2px;

          color: #7b899b;

          font-size: 7px;
        }


        .tipo span {
          display: inline-block !important;

          padding:
            4px 6px;

          border-radius: 5px;

          font-weight: 900;
        }


        .reserva {
          background: #e7f6ed;
          color: #14733f !important;
        }


        .encomenda {
          background: #fff3de;
          color: #96610b !important;
        }


        .quantidade {
          color: #536174;
          font-size: 8px;
        }


        .valor {
          color: #082e69;
          font-size: 9px;
          font-weight: 900;
          text-align: right;
        }


        .observacoes {
          margin:
            13px 16px 0;

          padding: 10px;

          border-radius: 8px;

          background: #fff9ec;
        }


        .observacoes p {
          margin: 4px 0 0;

          color: #685d42;

          font-size: 8px;
        }


        .pedido-rodape {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 15px;

          margin-top: 14px;

          padding:
            13px 16px;

          border-top:
            1px solid #edf1f5;
        }


        .total span {
          display: block;

          color: #7d8998;

          font-size: 7px;
        }


        .total strong {
          display: block;

          margin-top: 2px;

          color: #082e69;

          font-size: 18px;
        }


        .acoes {
          display: flex;

          align-items: center;

          gap: 7px;
        }


        .visualizar {
          min-height: 33px;

          padding:
            0 10px;

          border: 0;
          border-radius: 6px;

          cursor: pointer;

          background: #eef3f8;
          color: #496078;

          font-size: 7px;
          font-weight: 900;
        }


        .status-form {
          display: flex;

          gap: 5px;
        }


        .status-form select {
          min-height: 33px;

          padding:
            0 8px;

          border:
            1px solid #ccd6e1;

          border-radius: 6px;

          background: white;

          font-size: 8px;
        }


        .status-form button {
          min-height: 33px;

          padding:
            0 11px;

          border: 0;
          border-radius: 6px;

          cursor: pointer;

          background: #082e69;
          color: white;

          font-size: 7px;
          font-weight: 900;
        }


        .vazio {
          padding: 45px;

          border:
            1px dashed #bfccd8;

          border-radius: 12px;

          background: white;

          color: #7d8b9e;

          text-align: center;

          font-size: 10px;
        }


        @media(max-width:750px) {

          .indicadores {
            grid-template-columns:
              1fr;
          }


          .cliente {
            grid-template-columns:
              1fr;
          }


          .item {
            grid-template-columns:
              1fr 90px;
          }


          .pedido-rodape {
            align-items:
              stretch;

            flex-direction:
              column;
          }


          .acoes {
            align-items:
              stretch;

            flex-direction:
              column;
          }


          .status-form {
            width: 100%;
          }


          .status-form select,
          .status-form button,
          .visualizar {
            flex: 1;
          }

        }

      `}</style>

    </main>
  );
}