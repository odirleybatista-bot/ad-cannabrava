import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LojaClient from "./LojaClient";

export default async function LojaCannabravaPage() {

  const supabase =
    await createClient();

  const {
    data: produtos,
    error,
  } = await supabase
    .from("loja_produtos")
    .select(`
      id,
      nome,
      slug,
      descricao,
      preco,
      preco_promocional,
      estoque,
      permite_encomenda,
      destaque,
      sku,

      categoria:loja_categorias (
        id,
        nome,
        slug
      ),

      imagens:loja_produto_imagens (
        id,
        imagem_url,
        ordem
      ),

      cores:loja_produto_cores (
        id,
        cor,
        estoque,
        ativo
      )
    `)
    .eq("ativo", true)
    .order("destaque", {
      ascending: false,
    })
    .order("nome", {
      ascending: true,
    });


  if (error) {
    console.error(
      "Erro ao carregar loja:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );
  }


  const lista =
    (produtos ?? []).map(
      (produto: any) => ({

        ...produto,

        categoria:
          Array.isArray(
            produto.categoria
          )
            ? produto.categoria[0] ??
              null
            : produto.categoria,

        imagens:
          [...(
            produto.imagens ??
            []
          )].sort(
            (a: any, b: any) =>
              a.ordem - b.ordem
          ),

        cores:
          (
            produto.cores ??
            []
          ).filter(
            (cor: any) =>
              cor.ativo !== false
          ),

      })
    );


  return (
    <main>

      <header className="topo">

        <Link
          href="/portalcannabrava"
          className="marca"
        >
          <img
            src="/escudo.png"
            alt="A.D. Cannabrava"
          />

          <div>
            <span>
              ASSOCIAÇÃO DESPORTIVA
            </span>

            <strong>
              LOJA CANNABRAVA
            </strong>
          </div>
        </Link>


        <Link
          href="/portalcannabrava"
          className="voltar"
        >
          Portal Cannabrava
        </Link>

      </header>


      <section className="hero">

        <span>
          LOJA OFICIAL
        </span>

        <h1>
          Vista nossas cores.
        </h1>

        <p>
          Produtos oficiais e itens
          da A.D. Cannabrava disponíveis
          para reserva ou encomenda.
        </p>

        <small>
          Não realizamos pagamento
          diretamente pelo portal.
          Após o pedido, a Associação
          entrará em contato.
        </small>

      </section>


      <LojaClient
        produtos={lista}
      />


      <footer className="rodape">

        <img
          src="/escudo.png"
          alt=""
        />

        <div>
          <strong>
            A.D. Cannabrava
          </strong>

          <span>
            Força, Foco e União
          </span>
        </div>

      </footer>


      <style>{`

        * {
          box-sizing:
            border-box;
        }

        body {
          margin: 0;
        }

        .topo {
          min-height: 74px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          gap: 20px;

          padding:
            10px
            clamp(
              16px,
              6vw,
              100px
            );

          border-bottom:
            1px solid #e3e8ef;

          background: white;
        }


        .marca {
          display: flex;
          align-items: center;
          gap: 10px;

          color: inherit;
          text-decoration: none;
        }


        .marca img {
          width: 46px;
          height: 46px;
          object-fit: contain;
        }


        .marca span {
          display: block;

          color: #17834a;

          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }


        .marca strong {
          display: block;

          margin-top: 2px;

          color: #082e69;

          font-size: 17px;
        }


        .voltar {
          padding:
            9px 13px;

          border-radius: 8px;

          background: #082e69;
          color: white;

          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }


        .hero {
          padding:
            50px
            clamp(
              18px,
              7vw,
              120px
            );

          background:
            linear-gradient(
              120deg,
              #061f4d,
              #0b5791
            );

          color: white;
        }


        .hero > span {
          color: #75dda0;

          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
        }


        .hero h1 {
          margin:
            8px 0 6px;

          font-size:
            clamp(
              34px,
              5vw,
              64px
            );

          line-height: 1;
        }


        .hero p {
          max-width: 620px;

          margin:
            10px 0;

          font-size: 14px;
          line-height: 1.55;
        }


        .hero small {
          display: block;

          max-width: 650px;

          margin-top: 16px;

          color:
            rgba(
              255,
              255,
              255,
              .68
            );

          font-size: 10px;
        }


        .rodape {
          min-height: 90px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          padding: 20px;

          background: #061f4d;
          color: white;
        }


        .rodape img {
          width: 39px;
          height: 39px;
          object-fit: contain;
        }


        .rodape strong {
          display: block;
          font-size: 10px;
        }


        .rodape span {
          display: block;
          margin-top: 2px;
          opacity: .68;
          font-size: 7px;
        }


        @media(max-width:600px) {

          .topo {
            padding:
              9px 13px;
          }

          .marca strong {
            font-size: 13px;
          }

          .marca span {
            font-size: 5px;
          }

          .voltar {
            font-size: 7px;
          }

          .hero {
            padding:
              35px 17px;
          }

          .hero p {
            font-size: 12px;
          }

        }

      `}</style>

    </main>
  );
}