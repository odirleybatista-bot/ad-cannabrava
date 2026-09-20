import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import {
  adicionarCor,
  alternarProduto,
  cadastrarProduto,
} from "./actions";

export default async function LojaAdminPage() {

  const supabase = await createClient();

  const [
    categoriasResp,
    produtosResp,
  ] = await Promise.all([

    supabase
      .from("loja_categorias")
      .select("*")
      .order("ordem"),

    supabase
      .from("loja_produtos")
      .select(`
        *,
        categoria:loja_categorias (
          id,
          nome
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
      .order("criado_em", {
        ascending: false,
      }),

  ]);

  const categorias =
    categoriasResp.data ?? [];

  const produtos =
    (produtosResp.data ?? [])
      .map((produto: any) => ({
        ...produto,

        categoria:
          Array.isArray(produto.categoria)
            ? produto.categoria[0] ?? null
            : produto.categoria,

        imagens:
          [...(produto.imagens ?? [])]
            .sort(
              (a: any, b: any) =>
                a.ordem - b.ordem
            ),

        cores:
          produto.cores ?? [],
      }));

  return (
    <main className="pagina">

      <div className="topo">

        <div>
          <span className="rotulo">
            LOJA CANNABRAVA
          </span>

          <h1>
            Produtos
          </h1>

          <p>
            Cadastro de catálogo,
            imagens, cores e estoque.
          </p>
        </div>

        <div className="acoes-topo">

          <Link
            href="/portalcannabrava/loja"
            target="_blank"
          >
            Ver loja pública
          </Link>

          <Link
            href="/admin/loja/pedidos"
          >
            Pedidos
          </Link>

        </div>

      </div>


      <section className="bloco">

        <div className="titulo">
          <h2>
            Novo produto
          </h2>
        </div>

        <form
          action={cadastrarProduto}
          className="formulario"
        >

          <label>
            Nome do produto *

            <input
              name="nome"
              required
            />
          </label>


          <label>
            Categoria

            <select
              name="categoria_id"
              defaultValue=""
            >
              <option value="">
                Sem categoria
              </option>

              {categorias.map(
                (categoria: any) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nome}
                  </option>
                )
              )}

            </select>
          </label>


          <label>
            Preço *

            <input
              name="preco"
              required
              placeholder="75,00"
            />
          </label>


          <label>
            Preço promocional

            <input
              name="preco_promocional"
              placeholder="Opcional"
            />
          </label>


          <label>
            Estoque geral

            <input
              type="number"
              name="estoque"
              min="0"
              defaultValue="0"
            />
          </label>


          <label>
            SKU / Código

            <input
              name="sku"
            />
          </label>


          <label className="descricao">
            Descrição *

            <textarea
              name="descricao"
              required
              rows={4}
            />
          </label>


          <div className="opcoes">

            <label className="check">
              <input
                type="checkbox"
                name="permite_encomenda"
                defaultChecked
              />

              Permitir encomenda
            </label>

            <label className="check">
              <input
                type="checkbox"
                name="destaque"
              />

              Produto em destaque
            </label>

          </div>


          <div className="imagens">

            <strong>
              Imagens do produto
            </strong>

            <span>
              Até 4 imagens
            </span>

            <div className="imagens-grid">

              {[1,2,3,4].map(
                (numero) => (
                  <label
                    key={numero}
                  >
                    Imagem {numero}

                    <input
                      type="file"
                      name={`imagem_${numero}`}
                      accept="image/png,image/jpeg,image/webp"
                    />
                  </label>
                )
              )}

            </div>

          </div>


          <button
            className="salvar"
          >
            + Cadastrar produto
          </button>

        </form>

      </section>


      <section className="bloco">

        <div className="titulo">
          <h2>
            Produtos cadastrados
          </h2>

          <span>
            {produtos.length}
          </span>
        </div>


        <div className="produtos">

          {produtos.length === 0 ? (

            <div className="vazio">
              Nenhum produto cadastrado.
            </div>

          ) : (

            produtos.map(
              (produto: any) => (

                <article
                  className="produto"
                  key={produto.id}
                >

                  <div className="produto-imagem">

                    {produto.imagens?.[0] ? (
                      <img
                        src={
                          produto
                            .imagens[0]
                            .imagem_url
                        }
                        alt={
                          produto.nome
                        }
                      />
                    ) : (
                      <img
                        src="/escudo.png"
                        alt=""
                        className="placeholder"
                      />
                    )}

                  </div>


                  <div className="produto-info">

                    <span>
                      {
                        produto.categoria?.nome
                        ??
                        "Sem categoria"
                      }
                    </span>

                    <h3>
                      {produto.nome}
                    </h3>

                    <p>
                      {produto.descricao}
                    </p>


                    <div className="produto-dados">

                      <strong>
                        R$ {
                          Number(
                            produto.preco
                          )
                            .toFixed(2)
                            .replace(".", ",")
                        }
                      </strong>

                      <small>
                        Estoque geral: {
                          produto.estoque
                        }
                      </small>

                    </div>


                    <div className="cores-cadastradas">

                      {(produto.cores ?? []).map(
                        (cor: any) => (
                          <span
                            key={cor.id}
                          >
                            {cor.cor}: {
                              cor.estoque
                            }
                          </span>
                        )
                      )}

                    </div>


                    <form
                      action={adicionarCor}
                      className="form-cor"
                    >

                      <input
                        type="hidden"
                        name="produto_id"
                        value={produto.id}
                      />

                      <input
                        name="cor"
                        placeholder="Cor"
                        required
                      />

                      <input
                        type="number"
                        name="estoque"
                        min="0"
                        defaultValue="0"
                        placeholder="Estoque"
                      />

                      <button>
                        + Cor
                      </button>

                    </form>


                    <form
                      action={alternarProduto}
                    >

                      <input
                        type="hidden"
                        name="produto_id"
                        value={produto.id}
                      />

                      <input
                        type="hidden"
                        name="ativo"
                        value={
                          String(
                            produto.ativo
                          )
                        }
                      />

                      <button
                        className={
                          produto.ativo
                            ? "status ativo"
                            : "status inativo"
                        }
                      >
                        {
                          produto.ativo
                            ? "Ativo"
                            : "Inativo"
                        }
                      </button>

                    </form>

                  </div>

                </article>

              )
            )

          )}

        </div>

      </section>


      <style>{`

        * {
          box-sizing: border-box;
        }

        .pagina {
          min-height: 100vh;
          padding:
            24px
            clamp(15px, 3vw, 40px)
            60px;

          background: #f4f7fb;
          color: #17263d;
        }

        .topo {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .rotulo {
          color: #15854a;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .topo h1 {
          margin: 4px 0 2px;
          color: #082e69;
          font-size: 31px;
        }

        .topo p {
          margin: 0;
          color: #718096;
          font-size: 11px;
        }

        .acoes-topo {
          display: flex;
          gap: 8px;
        }

        .acoes-topo a {
          padding: 9px 12px;
          border-radius: 8px;
          background: #082e69;
          color: white;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .bloco {
          margin-top: 16px;
          padding: 20px;
          border: 1px solid #dfe6ee;
          border-radius: 14px;
          background: white;
        }

        .titulo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .titulo h2 {
          margin: 0;
          color: #082e69;
          font-size: 21px;
        }

        .titulo > span {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e9f3fd;
          color: #0a569b;
          font-weight: 900;
        }

        .formulario {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .formulario label {
          color: #536174;
          font-size: 9px;
          font-weight: 800;
        }

        .formulario input,
        .formulario textarea,
        .formulario select {
          width: 100%;
          margin-top: 5px;
          padding: 10px;
          border: 1px solid #ccd6e2;
          border-radius: 7px;
          background: white;
          color: #17263d;
        }

        .descricao {
          grid-column: span 3;
        }

        .opcoes {
          grid-column: span 3;
          display: flex;
          gap: 18px;
        }

        .check {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .check input {
          width: auto;
          margin: 0;
        }

        .imagens {
          grid-column: span 3;
          padding: 14px;
          border-radius: 10px;
          background: #f6f9fc;
        }

        .imagens > strong {
          display: block;
          color: #082e69;
          font-size: 11px;
        }

        .imagens > span {
          display: block;
          margin-top: 2px;
          color: #7d8998;
          font-size: 8px;
        }

        .imagens-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 9px;
          margin-top: 10px;
        }

        .salvar {
          grid-column: span 3;
          min-height: 42px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          background: #16884c;
          color: white;
          font-size: 10px;
          font-weight: 900;
        }

        .produtos {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(320px,1fr)
            );
          gap: 14px;
        }

        .produto {
          display: grid;
          grid-template-columns:
            120px 1fr;
          gap: 14px;

          padding: 14px;

          border: 1px solid #e0e7ef;
          border-radius: 12px;
        }

        .produto-imagem {
          width: 120px;
          height: 120px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 10px;
          background: #f4f6f8;
        }

        .produto-imagem img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .produto-imagem .placeholder {
          width: 60px;
          opacity: .3;
        }

        .produto-info > span {
          color: #16844a;
          font-size: 7px;
          font-weight: 900;
        }

        .produto-info h3 {
          margin: 3px 0 5px;
          color: #082e69;
          font-size: 16px;
        }

        .produto-info p {
          margin: 0;
          color: #6b788a;
          font-size: 9px;
          line-height: 1.4;
        }

        .produto-dados {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 9px;
        }

        .produto-dados strong {
          color: #082e69;
          font-size: 16px;
        }

        .produto-dados small {
          color: #7c8999;
          font-size: 8px;
        }

        .cores-cadastradas {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 9px;
        }

        .cores-cadastradas span {
          padding: 4px 6px;
          border-radius: 5px;
          background: #eef4f9;
          color: #4f6074;
          font-size: 7px;
        }

        .form-cor {
          display: grid;
          grid-template-columns:
            1fr 90px auto;
          gap: 6px;
          margin-top: 10px;
        }

        .form-cor input {
          min-width: 0;
          padding: 7px;
          border: 1px solid #d1dbe5;
          border-radius: 6px;
        }

        .form-cor button {
          border: 0;
          border-radius: 6px;
          cursor: pointer;
          background: #0b5c9f;
          color: white;
          font-size: 8px;
          font-weight: 900;
        }

        .status {
          width: 100%;
          margin-top: 9px;
          min-height: 31px;
          border: 0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 8px;
          font-weight: 900;
        }

        .status.ativo {
          background: #e7f6ed;
          color: #11713e;
        }

        .status.inativo {
          background: #f3f4f6;
          color: #6d7888;
        }

        .vazio {
          padding: 35px;
          border: 1px dashed #c8d3df;
          border-radius: 10px;
          color: #8491a3;
          text-align: center;
          font-size: 10px;
        }

        @media(max-width:850px) {

          .formulario {
            grid-template-columns:
              repeat(2,1fr);
          }

          .descricao,
          .opcoes,
          .imagens,
          .salvar {
            grid-column:
              span 2;
          }

          .imagens-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media(max-width:560px) {

          .topo {
            align-items: flex-start;
            flex-direction: column;
          }

          .formulario {
            grid-template-columns: 1fr;
          }

          .descricao,
          .opcoes,
          .imagens,
          .salvar {
            grid-column: auto;
          }

          .opcoes {
            flex-direction: column;
          }

          .imagens-grid {
            grid-template-columns: 1fr;
          }

          .produto {
            grid-template-columns:
              90px 1fr;
          }

          .produto-imagem {
            width: 90px;
            height: 90px;
          }

          .form-cor {
            grid-template-columns:
              1fr 80px;
          }

          .form-cor button {
            grid-column: 1 / -1;
            min-height: 31px;
          }
        }

      `}</style>

    </main>
  );
}