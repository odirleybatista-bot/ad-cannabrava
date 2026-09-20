"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";


type Imagem = {
  id: string;
  imagem_url: string;
  ordem: number;
};


type Cor = {
  id: string;
  cor: string;
  estoque: number;
};


type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  preco: number;
  preco_promocional:
    number | null;

  estoque: number;

  permite_encomenda:
    boolean;

  destaque: boolean;

  sku: string | null;

  categoria: {
    id: string;
    nome: string;
    slug: string;
  } | null;

  imagens: Imagem[];

  cores: Cor[];
};


type ItemCarrinho = {
  chave: string;

  produto_id: string;
  nome: string;

  imagem: string | null;

  cor_id: string | null;
  cor: string | null;

  quantidade: number;

  preco: number;

  estoqueDisponivel:
    number;

  permiteEncomenda:
    boolean;
};


function dinheiro(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}


function Galeria({
  produto,
}: {
  produto: Produto;
}) {

  const [
    atual,
    setAtual,
  ] = useState(0);


  const imagens =
    produto.imagens ?? [];


  const principal =
    imagens[atual]
    ?? imagens[0]
    ?? null;


  return (
    <div className="galeria">

      <div className="imagem-principal">

        {principal ? (
          <img
            src={
              principal.imagem_url
            }
            alt={
              produto.nome
            }
          />
        ) : (
          <div className="sem-imagem">
            <img
              src="/escudo.png"
              alt=""
            />

            <span>
              Imagem em breve
            </span>
          </div>
        )}

      </div>


      {imagens.length > 1 && (

        <div className="miniaturas">

          {imagens.map(
            (
              imagem,
              indice
            ) => (

              <button
                type="button"
                key={
                  imagem.id
                }
                onClick={() =>
                  setAtual(indice)
                }
                className={
                  indice === atual
                    ? "miniatura ativa"
                    : "miniatura"
                }
              >
                <img
                  src={
                    imagem.imagem_url
                  }
                  alt=""
                />
              </button>

            )
          )}

        </div>

      )}

    </div>
  );
}


function ProdutoCard({
  produto,
  adicionar,
}: {
  produto: Produto;

  adicionar:
    (
      produto: Produto,
      cor: Cor | null
    ) => void;
}) {

  const [
    corId,
    setCorId,
  ] = useState(
    produto.cores?.[0]?.id ??
    ""
  );


  const cor =
    produto.cores.find(
      (item) =>
        item.id === corId
    ) ?? null;


  const estoque =
    cor
      ? Number(
          cor.estoque ?? 0
        )
      : Number(
          produto.estoque ?? 0
        );


  const temEstoque =
    estoque > 0;


  const preco =
    Number(
      produto.preco_promocional
      ??
      produto.preco
      ??
      0
    );


  return (
    <article className="produto-card" id={`produto-${produto.id}`}>

      <Galeria
        produto={produto}
      />


      <div className="produto-conteudo">

        <div className="produto-topo">

          <div>

            {produto.categoria && (
              <span className="categoria">
                {
                  produto
                    .categoria
                    .nome
                }
              </span>
            )}

            <h2>
              {produto.nome}
            </h2>

          </div>


          <div
            className={
              temEstoque
                ? "estoque disponivel"
                : "estoque encomenda"
            }
          >
            {temEstoque
              ? `${estoque} em estoque`
              : "Sob encomenda"}
          </div>

        </div>


        <p className="descricao">
          {produto.descricao}
        </p>


        {produto.cores.length > 0 && (

          <div className="cores">

            <span>
              COR DISPONÍVEL
            </span>

            <div className="cores-lista">

              {produto.cores.map(
                (item) => (

                  <button
                    type="button"
                    key={
                      item.id
                    }
                    onClick={() =>
                      setCorId(
                        item.id
                      )
                    }
                    className={
                      item.id ===
                      corId
                        ? "cor ativa"
                        : "cor"
                    }
                  >
                    {item.cor}

                    <small>
                      {
                        item.estoque >
                        0
                          ? `${item.estoque} un.`
                          : "Encomenda"
                      }
                    </small>
                  </button>

                )
              )}

            </div>

          </div>

        )}


        <div className="produto-rodape">

          <div className="preco">

            {produto.preco_promocional && (
              <del>
                {dinheiro(
                  Number(
                    produto.preco
                  )
                )}
              </del>
            )}

            <strong>
              {dinheiro(preco)}
            </strong>

          </div>


          <button
            type="button"
            className={
              temEstoque
                ? "adicionar"
                : "adicionar encomendar"
            }
            disabled={
              !temEstoque &&
              !produto.permite_encomenda
            }
            onClick={() =>
              adicionar(
                produto,
                cor
              )
            }
          >
            {temEstoque
              ? "Reservar"
              : produto.permite_encomenda
                ? "Encomendar"
                : "Indisponível"}
          </button>

        </div>

      </div>

    </article>
  );
}


export default function LojaClient({
  produtos,
}: {
  produtos: Produto[];
}) {

  const [
    carrinho,
    setCarrinho,
  ] =
    useState<ItemCarrinho[]>(
      []
    );


  const [
    carrinhoAberto,
    setCarrinhoAberto,
  ] =
    useState(false);


  const [
    finalizando,
    setFinalizando,
  ] =
    useState(false);


  const [
    enviando,
    setEnviando,
  ] =
    useState(false);


  const [
    sucesso,
    setSucesso,
  ] =
    useState<{
      numero: number;
    } | null>(null);


  useEffect(() => {

    try {

      const salvo =
        localStorage.getItem(
          "cannabrava_loja_carrinho"
        );

      if (salvo) {
        setCarrinho(
          JSON.parse(salvo)
        );
      }

    } catch {
      // ignora carrinho inválido
    }

  }, []);


  useEffect(() => {

    localStorage.setItem(
      "cannabrava_loja_carrinho",
      JSON.stringify(
        carrinho
      )
    );

  }, [carrinho]);


  const totalItens =
    carrinho.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantidade,
      0
    );


  const totalEstimado =
    carrinho.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.preco *
          item.quantidade
        ),
      0
    );


  function adicionar(
    produto: Produto,
    cor: Cor | null
  ) {

    const chave =
      `${produto.id}:${cor?.id ?? "sem-cor"}`;


    setCarrinho(
      (atual) => {

        const existente =
          atual.find(
            (item) =>
              item.chave ===
              chave
          );


        if (existente) {

          return atual.map(
            (item) =>
              item.chave ===
              chave
                ? {
                    ...item,
                    quantidade:
                      item.quantidade +
                      1,
                  }
                : item
          );
        }


        const preco =
          Number(
            produto
              .preco_promocional
            ??
            produto.preco
            ??
            0
          );


        return [
          ...atual,

          {
            chave,

            produto_id:
              produto.id,

            nome:
              produto.nome,

            imagem:
              produto
                .imagens?.[0]
                ?.imagem_url
              ??
              null,

            cor_id:
              cor?.id
              ??
              null,

            cor:
              cor?.cor
              ??
              null,

            quantidade: 1,

            preco,

            estoqueDisponivel:
              cor
                ? Number(
                    cor.estoque ??
                    0
                  )
                : Number(
                    produto.estoque ??
                    0
                  ),

            permiteEncomenda:
              produto
                .permite_encomenda,
          },
        ];
      }
    );


    setCarrinhoAberto(
      true
    );
  }


  function alterarQuantidade(
    chave: string,
    quantidade: number
  ) {

    if (quantidade <= 0) {

      setCarrinho(
        (atual) =>
          atual.filter(
            (item) =>
              item.chave !==
              chave
          )
      );

      return;
    }


    setCarrinho(
      (atual) =>
        atual.map(
          (item) =>
            item.chave ===
            chave
              ? {
                  ...item,
                  quantidade,
                }
              : item
        )
    );
  }


  async function fecharPedido(
    event:
      React.FormEvent<
        HTMLFormElement
      >
  ) {

    event.preventDefault();


    if (
      carrinho.length === 0
    ) {
      return;
    }


    setEnviando(true);


    try {

      const form =
        new FormData(
          event.currentTarget
        );


      const supabase =
        createClient();


      const {
        data,
        error,
      } =
        await supabase.rpc(
          "criar_pedido_loja",
          {

            p_nome:
              String(
                form.get(
                  "nome"
                ) ?? ""
              ),

            p_telefone:
              String(
                form.get(
                  "telefone"
                ) ?? ""
              ),

            p_endereco:
              String(
                form.get(
                  "endereco"
                ) ?? ""
              ),

            p_observacoes:
              String(
                form.get(
                  "observacoes"
                ) ?? ""
              ),

            p_itens:
              carrinho.map(
                (item) => ({
                  produto_id:
                    item.produto_id,

                  cor_id:
                    item.cor_id,

                  quantidade:
                    item.quantidade,
                })
              ),
          }
        );


      if (error) {
        throw error;
      }


      const resultado =
        data as {
          numero: number;
        };


      setSucesso({
        numero:
          resultado.numero,
      });


      setCarrinho([]);

      localStorage.removeItem(
        "cannabrava_loja_carrinho"
      );


      setFinalizando(
        false
      );


    } catch (erro: any) {

      alert(
        erro?.message
        ??
        "Não foi possível registrar o pedido."
      );

    } finally {

      setEnviando(false);

    }
  }


  return (
    <>

      <section className="loja">

        <div className="loja-titulo">

          <div>
            <span>
              CATÁLOGO
            </span>

            <h2>
              Produtos Cannabrava
            </h2>

            <p>
              Escolha seus itens para
              reserva ou encomenda.
            </p>
          </div>


          <button
            type="button"
            className="botao-carrinho"
            onClick={() =>
              setCarrinhoAberto(
                true
              )
            }
          >
            Carrinho

            <strong>
              {totalItens}
            </strong>
          </button>

        </div>


        {produtos.length === 0 ? (

          <div className="vazio">

            <img
              src="/escudo.png"
              alt=""
            />

            <strong>
              A loja está sendo preparada.
            </strong>

            <span>
              Em breve nossos produtos
              estarão disponíveis aqui.
            </span>

          </div>

        ) : (

          <div className="produtos">

            {produtos.map(
              (produto) => (

                <ProdutoCard
                  key={
                    produto.id
                  }
                  produto={
                    produto
                  }
                  adicionar={
                    adicionar
                  }
                />

              )
            )}

          </div>

        )}

      </section>


      {carrinhoAberto && (

        <div
          className="fundo-modal"
          onClick={() =>
            setCarrinhoAberto(
              false
            )
          }
        >

          <aside
            className="carrinho"
            onClick={
              (event) =>
                event.stopPropagation()
            }
          >

            <div className="carrinho-topo">

              <div>
                <span>
                  LOJA CANNABRAVA
                </span>

                <h2>
                  Seu carrinho
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCarrinhoAberto(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <div className="carrinho-itens">

              {carrinho.length === 0 ? (

                <div className="carrinho-vazio">
                  Seu carrinho está vazio.
                </div>

              ) : (

                carrinho.map(
                  (item) => {

                    const tipo =
                      item
                        .estoqueDisponivel >=
                      item.quantidade
                        ? "Reserva"
                        : "Encomenda";


                    return (
                      <div
                        className="item"
                        key={
                          item.chave
                        }
                      >

                        <div className="item-imagem">

                          {item.imagem ? (
                            <img
                              src={
                                item.imagem
                              }
                              alt=""
                            />
                          ) : (
                            <img
                              src="/escudo.png"
                              alt=""
                            />
                          )}

                        </div>


                        <div className="item-info">

                          <strong>
                            {item.nome}
                          </strong>

                          {item.cor && (
                            <span>
                              Cor: {
                                item.cor
                              }
                            </span>
                          )}

                          <small
                            className={
                              tipo ===
                              "Reserva"
                                ? "tipo-reserva"
                                : "tipo-encomenda"
                            }
                          >
                            {tipo}
                          </small>

                          <div className="quantidade">

                            <button
                              type="button"
                              onClick={() =>
                                alterarQuantidade(
                                  item.chave,
                                  item.quantidade -
                                  1
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {
                                item.quantidade
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                alterarQuantidade(
                                  item.chave,
                                  item.quantidade +
                                  1
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                        </div>


                        <div className="item-preco">
                          {dinheiro(
                            item.preco *
                            item.quantidade
                          )}
                        </div>

                      </div>
                    );
                  }
                )

              )}

            </div>


            {carrinho.length > 0 && (

              <div className="carrinho-rodape">

                <div className="total">

                  <span>
                    Valor estimado
                  </span>

                  <strong>
                    {dinheiro(
                      totalEstimado
                    )}
                  </strong>

                </div>


                <small>
                  Este valor não representa
                  pagamento realizado.
                </small>


                <button
                  type="button"
                  className="finalizar"
                  onClick={() =>
                    setFinalizando(
                      true
                    )
                  }
                >
                  Finalizar pedido
                </button>

              </div>

            )}

          </aside>

        </div>

      )}


      {finalizando && (

        <div className="fundo-modal">

          <div className="checkout">

            <div className="checkout-topo">

              <div>
                <span>
                  FINALIZAÇÃO
                </span>

                <h2>
                  Seus dados
                </h2>
              </div>


              <button
                type="button"
                onClick={() =>
                  setFinalizando(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <p className="checkout-aviso">
              Após o envio, a A.D.
              Cannabrava entrará em
              contato para confirmar
              disponibilidade, reserva
              ou encomenda.
            </p>


            <form
              onSubmit={
                fecharPedido
              }
            >

              <label>
                Nome completo *

                <input
                  name="nome"
                  required
                  minLength={3}
                />
              </label>


              <label>
                Telefone para contato *

                <input
                  name="telefone"
                  required
                  minLength={8}
                  placeholder="(74) 99999-9999"
                />
              </label>


              <label>
                Endereço completo *

                <textarea
                  name="endereco"
                  required
                  minLength={5}
                  rows={3}
                  placeholder="Rua, número, bairro, cidade..."
                />
              </label>


              <label>
                Observações

                <textarea
                  name="observacoes"
                  rows={3}
                  placeholder="Tamanho, referência ou outra informação..."
                />
              </label>


              <div className="checkout-total">

                <span>
                  Valor estimado
                </span>

                <strong>
                  {dinheiro(
                    totalEstimado
                  )}
                </strong>

              </div>


              <button
                type="submit"
                className="enviar-pedido"
                disabled={
                  enviando
                }
              >
                {enviando
                  ? "Enviando..."
                  : "Enviar pedido"}
              </button>

            </form>

          </div>

        </div>

      )}


      {sucesso && (

        <div className="fundo-modal">

          <div className="sucesso">

            <img
              src="/escudo.png"
              alt=""
            />

            <span>
              PEDIDO REGISTRADO
            </span>

            <h2>
              Obrigado!
            </h2>

            <p>
              Seu pedido foi registrado
              com sucesso.
            </p>

            <strong>
              Pedido nº {
                sucesso.numero
              }
            </strong>

            <small>
              A A.D. Cannabrava entrará
              em contato pelo telefone
              informado.
            </small>

            <button
              type="button"
              onClick={() =>
                setSucesso(null)
              }
            >
              Continuar
            </button>

          </div>

        </div>

      )}


      <style jsx global>{`

        .loja {
          padding:
            38px
            clamp(
              15px,
              6vw,
              100px
            )
            65px;

          background: #f4f7fb;
        }


        .loja-titulo {
          display: flex;
          justify-content:
            space-between;
          align-items: flex-end;

          gap: 20px;

          margin-bottom: 22px;
        }


        .loja-titulo > div > span {
          color: #17834a;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: .11em;
        }


        .loja-titulo h2 {
          margin: 4px 0;
          color: #082e69;
          font-size: 30px;
        }


        .loja-titulo p {
          margin: 0;
          color: #69778a;
          font-size: 11px;
        }


        .botao-carrinho {
          min-height: 41px;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 0 15px;

          border: 0;
          border-radius: 9px;

          cursor: pointer;

          background: #082e69;
          color: white;

          font-size: 10px;
          font-weight: 900;
        }


        .botao-carrinho strong {
          min-width: 23px;
          height: 23px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 999px;

          background: #168b4d;
        }


        .produtos {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fill,
              minmax(
                280px,
                1fr
              )
            );

          gap: 18px;
        }


        .produto-card {
          scroll-margin-top: 90px;
          overflow: hidden;

          border:
            1px solid #dde5ee;

          border-radius: 15px;

          background: white;

          box-shadow:
            0 7px 25px
            rgba(
              15,
              30,
              55,
              .04
            );
        }


        .galeria {
          padding: 10px;

          background:
            #f3f5f8;
        }


        .imagem-principal {
          width: 100%;
          aspect-ratio: 1 / 1;

          overflow: hidden;

          border-radius: 11px;

          background: white;
        }


        .imagem-principal > img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }


        .sem-imagem {
          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 8px;

          color: #8c98a8;

          font-size: 9px;
        }


        .sem-imagem img {
          width: 75px;
          opacity: .25;
        }


        .miniaturas {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);

          gap: 6px;

          margin-top: 7px;
        }


        .miniatura {
          aspect-ratio: 1;

          overflow: hidden;

          padding: 3px;

          border:
            1px solid transparent;

          border-radius: 6px;

          cursor: pointer;

          background: white;
        }


        .miniatura.ativa {
          border-color:
            #16884c;
        }


        .miniatura img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }


        .produto-conteudo {
          padding: 16px;
        }


        .produto-topo {
          display: flex;
          align-items: flex-start;
          justify-content:
            space-between;

          gap: 10px;
        }


        .categoria {
          color: #18884c;

          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }


        .produto-topo h2 {
          margin: 3px 0 0;

          color: #092e68;
          font-size: 17px;
        }


        .estoque {
          flex: 0 0 auto;

          padding:
            5px 7px;

          border-radius: 999px;

          font-size: 7px;
          font-weight: 900;
        }


        .estoque.disponivel {
          background: #e7f6ed;
          color: #11733e;
        }


        .estoque.encomenda {
          background: #fff4df;
          color: #9b6209;
        }


        .descricao {
          min-height: 44px;

          margin:
            10px 0 14px;

          color: #677588;

          font-size: 10px;
          line-height: 1.45;
        }


        .cores > span {
          display: block;

          color: #798699;

          font-size: 7px;
          font-weight: 900;
        }


        .cores-lista {
          display: flex;
          flex-wrap: wrap;

          gap: 6px;

          margin-top: 6px;
        }


        .cor {
          min-width: 64px;

          padding: 6px 8px;

          border:
            1px solid #dce4ed;

          border-radius: 7px;

          cursor: pointer;

          background: white;
          color: #304159;

          font-size: 8px;
          font-weight: 800;
        }


        .cor small {
          display: block;

          margin-top: 2px;

          color: #8793a3;

          font-size: 6px;
        }


        .cor.ativa {
          border-color: #0d6e43;
          background: #eef8f2;
          color: #0d6e43;
        }


        .produto-rodape {
          display: flex;
          align-items: center;
          justify-content:
            space-between;

          gap: 10px;

          margin-top: 16px;

          padding-top: 13px;

          border-top:
            1px solid #edf0f4;
        }


        .preco del {
          display: block;

          color: #929dab;
          font-size: 8px;
        }


        .preco strong {
          display: block;

          margin-top: 1px;

          color: #082e69;
          font-size: 20px;
        }


        .adicionar {
          min-height: 38px;

          padding: 0 14px;

          border: 0;
          border-radius: 8px;

          cursor: pointer;

          background: #17894d;
          color: white;

          font-size: 9px;
          font-weight: 900;
        }


        .adicionar.encomendar {
          background: #0b5d9d;
        }


        .adicionar:disabled {
          cursor: not-allowed;
          background: #a9b1bb;
        }


        .vazio {
          min-height: 260px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 8px;

          border:
            1px dashed #bfcbd8;

          border-radius: 14px;

          background: white;
          color: #738196;
        }


        .vazio img {
          width: 75px;
          opacity: .35;
        }


        .vazio strong {
          color: #082e69;
          font-size: 15px;
        }


        .vazio span {
          font-size: 10px;
        }


        .fundo-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;

          display: flex;
          justify-content: flex-end;

          background:
            rgba(
              1,
              15,
              39,
              .65
            );

          backdrop-filter:
            blur(3px);
        }


        .carrinho {
          width:
            min(
              440px,
              100%
            );

          height: 100%;

          display: flex;
          flex-direction: column;

          background: white;

          box-shadow:
            -10px 0 35px
            rgba(
              0,
              0,
              0,
              .15
            );
        }


        .carrinho-topo,
        .checkout-topo {
          display: flex;
          align-items: center;
          justify-content:
            space-between;

          gap: 15px;

          padding: 18px;

          border-bottom:
            1px solid #e5eaf0;
        }


        .carrinho-topo span,
        .checkout-topo span {
          color: #16894c;

          font-size: 7px;
          font-weight: 900;
          letter-spacing: .1em;
        }


        .carrinho-topo h2,
        .checkout-topo h2 {
          margin: 3px 0 0;

          color: #082e69;
          font-size: 21px;
        }


        .carrinho-topo button,
        .checkout-topo button {
          width: 34px;
          height: 34px;

          border: 0;
          border-radius: 50%;

          cursor: pointer;

          background: #eef2f6;
          color: #24364c;

          font-size: 20px;
        }


        .carrinho-itens {
          flex: 1;

          overflow-y: auto;

          padding: 12px;
        }


        .item {
          display: grid;

          grid-template-columns:
            64px
            minmax(0,1fr)
            auto;

          gap: 10px;

          padding:
            10px 0;

          border-bottom:
            1px solid #edf1f5;
        }


        .item-imagem {
          width: 64px;
          height: 64px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 8px;

          background: #f4f6f8;
        }


        .item-imagem img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }


        .item-info strong {
          display: block;

          color: #102641;
          font-size: 10px;
        }


        .item-info > span {
          display: block;

          margin-top: 2px;

          color: #6e7c8e;
          font-size: 8px;
        }


        .item-info small {
          display: inline-block;

          margin-top: 5px;

          padding:
            3px 5px;

          border-radius: 4px;

          font-size: 6px;
          font-weight: 900;
        }


        .tipo-reserva {
          background: #e7f6ed;
          color: #10733e;
        }


        .tipo-encomenda {
          background: #fff1db;
          color: #98610a;
        }


        .quantidade {
          display: flex;
          align-items: center;

          gap: 7px;

          margin-top: 7px;
        }


        .quantidade button {
          width: 23px;
          height: 23px;

          border:
            1px solid #d9e1ea;

          border-radius: 5px;

          cursor: pointer;

          background: white;
        }


        .quantidade span {
          min-width: 18px;
          text-align: center;
          font-size: 9px;
        }


        .item-preco {
          color: #082e69;
          font-size: 9px;
          font-weight: 900;
        }


        .carrinho-vazio {
          padding: 40px;
          text-align: center;
          color: #8190a3;
          font-size: 10px;
        }


        .carrinho-rodape {
          padding: 17px;

          border-top:
            1px solid #dde5ed;

          background: #f8fafc;
        }


        .total {
          display: flex;
          align-items: center;
          justify-content:
            space-between;
        }


        .total span {
          color: #5e6c7f;
          font-size: 9px;
        }


        .total strong {
          color: #082e69;
          font-size: 20px;
        }


        .carrinho-rodape > small {
          display: block;

          margin-top: 4px;

          color: #8b96a4;
          font-size: 7px;
        }


        .finalizar,
        .enviar-pedido {
          width: 100%;
          min-height: 44px;

          margin-top: 13px;

          border: 0;
          border-radius: 8px;

          cursor: pointer;

          background: #168a4d;
          color: white;

          font-size: 10px;
          font-weight: 900;
        }


        .checkout {
          width:
            min(
              520px,
              calc(
                100% - 24px
              )
            );

          max-height:
            calc(
              100vh - 30px
            );

          margin: auto;

          overflow-y: auto;

          border-radius: 14px;

          background: white;
        }


        .checkout-aviso {
          margin:
            15px 18px 0;

          padding: 11px;

          border-radius: 8px;

          background: #eef6ff;
          color: #44617f;

          font-size: 9px;
          line-height: 1.5;
        }


        .checkout form {
          display: flex;
          flex-direction: column;

          gap: 12px;

          padding: 18px;
        }


        .checkout label {
          color: #435268;
          font-size: 9px;
          font-weight: 800;
        }


        .checkout input,
        .checkout textarea {
          width: 100%;

          margin-top: 5px;
          padding: 10px;

          border:
            1px solid #ccd6e1;

          border-radius: 7px;

          font: inherit;
          color: #162941;
        }


        .checkout-total {
          display: flex;
          justify-content:
            space-between;
          align-items: center;

          padding: 12px;

          border-radius: 8px;

          background: #f5f8fb;
        }


        .checkout-total span {
          font-size: 9px;
        }


        .checkout-total strong {
          color: #082e69;
          font-size: 18px;
        }


        .enviar-pedido:disabled {
          opacity: .6;
          cursor: wait;
        }


        .sucesso {
          width:
            min(
              390px,
              calc(
                100% - 30px
              )
            );

          margin: auto;

          padding: 30px;

          border-radius: 15px;

          background: white;

          text-align: center;
        }


        .sucesso img {
          width: 72px;
          height: 72px;
          object-fit: contain;
        }


        .sucesso > span {
          display: block;

          margin-top: 10px;

          color: #158548;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
        }


        .sucesso h2 {
          margin:
            5px 0;

          color: #082e69;
        }


        .sucesso p {
          margin: 0;
          color: #637186;
          font-size: 10px;
        }


        .sucesso > strong {
          display: block;

          margin: 15px 0 5px;

          color: #082e69;
          font-size: 18px;
        }


        .sucesso > small {
          display: block;

          color: #7b8796;
          font-size: 8px;
        }


        .sucesso button {
          width: 100%;
          min-height: 40px;

          margin-top: 17px;

          border: 0;
          border-radius: 8px;

          cursor: pointer;

          background: #082e69;
          color: white;

          font-weight: 900;
        }


        @media(max-width:600px) {

          .loja {
            padding:
              27px
              12px
              45px;
          }


          .loja-titulo {
            align-items:
              center;
          }


          .loja-titulo h2 {
            font-size: 23px;
          }


          .produtos {
            grid-template-columns:
              1fr;
          }


          .produto-card {
          scroll-margin-top: 90px;
            border-radius: 12px;
          }


          .descricao {
            min-height: 0;
          }


          .fundo-modal {
            align-items:
              flex-end;
          }


          .carrinho {
            width: 100%;
          }


          .checkout {
            margin:
              auto
              12px
              12px;
          }

        }

      `}</style>

    </>
  );
}