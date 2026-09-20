import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export default async function ProdutosLojaSidebar() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loja_produtos")
    .select(`
      id,
      nome,
      preco,
      preco_promocional,
      estoque,
      permite_encomenda,
      imagens:loja_produto_imagens (
        imagem_url,
        ordem
      ),
      cores:loja_produto_cores (
        estoque,
        ativo
      )
    `)
    .eq("ativo", true)
    .order("destaque", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(5);

  const produtos = (data ?? []).map((produto: any) => {
    const imagens = [...(produto.imagens ?? [])]
      .sort((a: any, b: any) => a.ordem - b.ordem);

    const cores = (produto.cores ?? [])
      .filter((cor: any) => cor.ativo !== false);

    const estoque =
      cores.length > 0
        ? cores.reduce(
            (total: number, cor: any) =>
              total + Number(cor.estoque ?? 0),
            0
          )
        : Number(produto.estoque ?? 0);

    return {
      ...produto,
      estoqueCalculado: estoque,
      imagem: imagens[0]?.imagem_url ?? null,
    };
  });

  return (
    <aside className="loja-lateral">

      <div className="loja-lateral-topo">
        <div>
          <span>LOJA CANNABRAVA</span>
          <strong>Nossos produtos</strong>
        </div>

        <Link href="/portalcannabrava/loja">
          VER LOJA
        </Link>
      </div>

      {produtos.length === 0 ? (

        <Link
          href="/portalcannabrava/loja"
          className="loja-sem-produtos"
        >
          <img src="/escudo.png" alt="" />

          <strong>
            Loja Cannabrava
          </strong>

          <span>
            Produtos em breve
          </span>
        </Link>

      ) : (

        <div className="loja-lateral-lista">

          {produtos.map((produto: any) => {

            const valor = Number(
              produto.preco_promocional
              ?? produto.preco
              ?? 0
            );

            return (
              <Link
                key={produto.id}
                href={`/portalcannabrava/loja#produto-${produto.id}`}
                className="loja-produto-mini"
              >

                <div className="loja-produto-foto">

                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                    />
                  ) : (
                    <img
                      src="/escudo.png"
                      alt=""
                      className="sem-foto"
                    />
                  )}

                </div>

                <div className="loja-produto-dados">

                  <strong>
                    {produto.nome}
                  </strong>

                  <b>
                    {moeda(valor)}
                  </b>

                  <small
                    className={
                      produto.estoqueCalculado > 0
                        ? "estoque-ok"
                        : "estoque-encomenda"
                    }
                  >
                    {produto.estoqueCalculado > 0
                      ? `${produto.estoqueCalculado} disponível`
                      : produto.permite_encomenda
                        ? "Sob encomenda"
                        : "Indisponível"}
                  </small>

                </div>

              </Link>
            );
          })}

        </div>
      )}

      <style>{`

        .loja-lateral {
          margin-top: 12px;
          overflow: hidden;
          border: 1px solid #dce5ee;
          border-radius: 12px;
          background: white;
        }

        .loja-lateral-topo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding: 10px;
          background: #082e69;
          color: white;
        }

        .loja-lateral-topo span {
          display: block;
          color: #7cdda1;
          font-size: 6px;
          font-weight: 900;
        }

        .loja-lateral-topo strong {
          display: block;
          margin-top: 2px;
          font-size: 9px;
        }

        .loja-lateral-topo a {
          flex: 0 0 auto;
          padding: 5px 6px;
          border-radius: 5px;
          background: #16884b;
          color: white;
          font-size: 6px;
          font-weight: 900;
          text-decoration: none;
        }

        .loja-lateral-lista {
          padding: 5px;
        }

        .loja-produto-mini {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 7px;
          padding: 6px;
          border-bottom: 1px solid #edf1f5;
          color: inherit;
          text-decoration: none;
        }

        .loja-produto-mini:last-child {
          border-bottom: 0;
        }

        .loja-produto-mini:hover {
          background: #f4f8fb;
        }

        .loja-produto-foto {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 7px;
          background: #f2f4f7;
        }

        .loja-produto-foto img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .loja-produto-foto img.sem-foto {
          width: 30px;
          height: 30px;
          opacity: .3;
        }

        .loja-produto-dados {
          min-width: 0;
        }

        .loja-produto-dados strong {
          display: block;
          color: #17345a;
          font-size: 7px;
          line-height: 1.25;
        }

        .loja-produto-dados b {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 9px;
        }

        .loja-produto-dados small {
          display: block;
          margin-top: 2px;
          font-size: 6px;
          font-weight: 800;
        }

        .estoque-ok {
          color: #148246;
        }

        .estoque-encomenda {
          color: #a66b09;
        }

        .loja-sem-produtos {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 18px 10px;
          color: inherit;
          text-align: center;
          text-decoration: none;
        }

        .loja-sem-produtos img {
          width: 45px;
          opacity: .3;
        }

        .loja-sem-produtos strong {
          margin-top: 7px;
          color: #082e69;
          font-size: 9px;
        }

        .loja-sem-produtos span {
          margin-top: 2px;
          color: #7c8999;
          font-size: 7px;
        }

        @media(max-width:700px) {

          .loja-lateral {
            width: 100%;
            margin-top: 8px;
          }

          .loja-lateral-lista {
            display: flex;
            overflow-x: auto;
            gap: 5px;
          }

          .loja-produto-mini {
            flex: 0 0 160px;
            border-bottom: 0;
            border-right: 1px solid #edf1f5;
          }

        }

      `}</style>

    </aside>
  );
}