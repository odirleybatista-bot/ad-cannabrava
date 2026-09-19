import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  adicionarEquipeGrupo,
  cadastrarEquipe,
  criarGrupo,
  removerEquipeCompeticao,
  removerEquipeGrupo,
  salvarLogoCompeticao,
  salvarLogoEquipe,
} from "./actions";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


function valor(
  objeto: any,
  ...campos: string[]
) {
  for (const campo of campos) {
    if (
      objeto?.[campo] !== undefined &&
      objeto?.[campo] !== null &&
      objeto?.[campo] !== ""
    ) {
      return objeto[campo];
    }
  }

  return "—";
}


export default async function CompeticaoDetalhePage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();


  const {
    data: competicao,
    error: erroCompeticao,
  } = await supabase
    .from("competicoes")
    .select("*")
    .eq("id", id)
    .maybeSingle();


  if (
    erroCompeticao ||
    !competicao
  ) {
    notFound();
  }


  const [
    equipesResposta,
    gruposResposta,
    grupoEquipesResposta,
    partidasResposta,
  ] = await Promise.all([

    supabase
      .from("competicao_equipes")
      .select(`
        id,
        status,
        numero_inscricao,
        equipe:equipes (
          id,
          nome,
          nome_curto,
          sigla,
          cidade,
          uf,
          modalidade,
          logo_url,
          ativo
        )
      `)
      .eq("competicao_id", id)
      .order(
        "numero_inscricao",
        {
          ascending: true,
          nullsFirst: false,
        }
      ),

    supabase
      .from("competicao_grupos")
      .select("*")
      .eq("competicao_id", id)
      .order(
        "ordem",
        {
          ascending: true,
        }
      ),

    supabase
      .from("competicao_grupo_equipes")
      .select(`
        id,
        grupo_id,
        equipe_id,
        equipe:equipes (
          id,
          nome,
          nome_curto,
          sigla,
          logo_url
        )
      `),

    supabase
      .from("partidas")
      .select(`
        id,
        adversario,
        data_jogo,
        horario,
        local,
        rodada,
        fase,
        grupo,
        status,
        gols_cannabrava,
        gols_adversario
      `)
      .eq("competicao_id", id)
      .order(
        "data_jogo",
        {
          ascending: true,
        }
      ),
  ]);


  const equipes =
    (equipesResposta.data ?? [])
      .map((item: any) => ({
        ...item,
        equipe:
          Array.isArray(item.equipe)
            ? item.equipe[0]
            : item.equipe,
      }))
      .filter(
        (item: any) =>
          item.equipe
      );


  const grupos =
    gruposResposta.data ?? [];


  const grupoIds =
    new Set(
      grupos.map(
        (grupo: any) =>
          grupo.id
      )
    );


  const grupoEquipes =
    (grupoEquipesResposta.data ?? [])
      .map((item: any) => ({
        ...item,
        equipe:
          Array.isArray(item.equipe)
            ? item.equipe[0]
            : item.equipe,
      }))
      .filter(
        (item: any) =>
          grupoIds.has(
            item.grupo_id
          )
      );


  const partidas =
    partidasResposta.data ?? [];


  const nomeCompeticao =
    valor(
      competicao,
      "nome",
      "titulo"
    );


  const modalidade =
    valor(
      competicao,
      "modalidade"
    );


  const temporada =
    valor(
      competicao,
      "temporada",
      "ano"
    );


  const status =
    valor(
      competicao,
      "status",
      "situacao"
    );


  return (
    <main className="pagina">

      <div className="topo-voltar">
        <Link
          href="/admin/esportivo/competicoes"
          className="voltar"
        >
          ← Voltar para competições
        </Link>
      </div>


      <section className="hero">

        <div className="logo-competicao">

          {competicao.logo_url ? (
            <img
              src={competicao.logo_url}
              alt={nomeCompeticao}
            />
          ) : (
            <div className="sem-logo">
              🏆
            </div>
          )}

        </div>


        <div className="hero-info">

          <span className="etiqueta">
            COMPETIÇÃO
          </span>

          <h1>
            {nomeCompeticao}
          </h1>

          <div className="hero-meta">

            <span>
              {modalidade}
            </span>

            <span>•</span>

            <span>
              {temporada}
            </span>

            <span>•</span>

            <span>
              {status}
            </span>

          </div>

        </div>


        <form
          action={salvarLogoCompeticao}
          className="upload-logo"
        >

          <input
            type="hidden"
            name="competicao_id"
            value={id}
          />

          <label>
            Logotipo do campeonato
          </label>

          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp"
            required
          />

          <button>
            Atualizar logotipo
          </button>

        </form>

      </section>


      <section className="indicadores">

        <div className="indicador">
          <span>
            EQUIPES
          </span>

          <strong>
            {equipes.length}
          </strong>
        </div>


        <div className="indicador">
          <span>
            GRUPOS
          </span>

          <strong>
            {grupos.length}
          </strong>
        </div>


        <div className="indicador">
          <span>
            PARTIDAS
          </span>

          <strong>
            {partidas.length}
          </strong>
        </div>


        <div className="indicador">
          <span>
            FINALIZADAS
          </span>

          <strong>
            {
              partidas.filter(
                (p: any) =>
                  p.status ===
                  "finalizada"
              ).length
            }
          </strong>
        </div>

      </section>


      <nav className="abas">
        <a href="#visao-geral">
          Visão Geral
        </a>

        <a href="#equipes">
          Equipes
        </a>

        <a href="#grupos">
          Grupos
        </a>

        <a href="#jogos">
          Jogos
        </a>

        <a href="#classificacao">
          Classificação
        </a>
      </nav>


      <section
        id="visao-geral"
        className="bloco"
      >

        <div className="titulo-bloco">
          <div>
            <span>
              COMPETIÇÃO
            </span>

            <h2>
              Visão Geral
            </h2>
          </div>
        </div>


        <div className="dados-grid">

          <div className="dado">
            <span>
              Nome
            </span>

            <strong>
              {nomeCompeticao}
            </strong>
          </div>

          <div className="dado">
            <span>
              Modalidade
            </span>

            <strong>
              {modalidade}
            </strong>
          </div>

          <div className="dado">
            <span>
              Temporada
            </span>

            <strong>
              {temporada}
            </strong>
          </div>

          <div className="dado">
            <span>
              Situação
            </span>

            <strong>
              {status}
            </strong>
          </div>

        </div>

      </section>


      <section
        id="equipes"
        className="bloco"
      >

        <div className="titulo-bloco">
          <div>
            <span>
              PARTICIPANTES
            </span>

            <h2>
              Equipes
            </h2>
          </div>

          <strong className="quantidade">
            {equipes.length}
          </strong>
        </div>


        <form
          action={cadastrarEquipe}
          className="formulario"
        >

          <input
            type="hidden"
            name="competicao_id"
            value={id}
          />


          <div className="campo campo-grande">
            <label>
              Nome da equipe *
            </label>

            <input
              name="nome"
              placeholder="Ex.: A.D. Cannabrava"
              required
            />
          </div>


          <div className="campo">
            <label>
              Nome curto
            </label>

            <input
              name="nome_curto"
              placeholder="Cannabrava"
            />
          </div>


          <div className="campo">
            <label>
              Sigla
            </label>

            <input
              name="sigla"
              maxLength={10}
              placeholder="ADC"
            />
          </div>


          <div className="campo">
            <label>
              Cidade
            </label>

            <input
              name="cidade"
              defaultValue="Canarana"
            />
          </div>


          <div className="campo campo-uf">
            <label>
              UF
            </label>

            <input
              name="uf"
              maxLength={2}
              defaultValue="BA"
            />
          </div>


          <div className="campo">
            <label>
              Modalidade
            </label>

            <input
              name="modalidade"
              defaultValue={
                modalidade === "—"
                  ? "Futebol"
                  : modalidade
              }
            />
          </div>


          <div className="campo-botao">
            <button className="botao-principal">
              + Cadastrar equipe
            </button>
          </div>

        </form>


        <div className="equipes-grid">

          {equipes.length === 0 ? (

            <div className="vazio">
              Nenhuma equipe vinculada
              a esta competição.
            </div>

          ) : (

            equipes.map(
              (item: any) => {

                const equipe =
                  item.equipe;

                return (
                  <article
                    className="equipe-card"
                    key={item.id}
                  >

                    <div className="equipe-topo">

                      <div className="escudo">

                        {equipe.logo_url ? (
                          <img
                            src={
                              equipe.logo_url
                            }
                            alt={
                              equipe.nome
                            }
                          />
                        ) : (
                          <span>
                            ⚽
                          </span>
                        )}

                      </div>


                      <div className="equipe-info">

                        <strong>
                          {equipe.nome}
                        </strong>

                        <span>
                          {
                            equipe.cidade ||
                            "Cidade não informada"
                          }

                          {
                            equipe.uf
                              ? ` - ${equipe.uf}`
                              : ""
                          }
                        </span>

                        <small>
                          {
                            equipe.sigla ||
                            equipe.nome_curto ||
                            "Sem sigla"
                          }
                        </small>

                      </div>

                    </div>


                    <form
                      action={
                        salvarLogoEquipe
                      }
                      className="form-logo-equipe"
                    >

                      <input
                        type="hidden"
                        name="competicao_id"
                        value={id}
                      />

                      <input
                        type="hidden"
                        name="equipe_id"
                        value={equipe.id}
                      />

                      <input
                        type="file"
                        name="logo"
                        accept="image/png,image/jpeg,image/webp"
                        required
                      />

                      <button>
                        Alterar escudo
                      </button>

                    </form>


                    <form
                      action={
                        removerEquipeCompeticao
                      }
                    >

                      <input
                        type="hidden"
                        name="competicao_id"
                        value={id}
                      />

                      <input
                        type="hidden"
                        name="equipe_id"
                        value={equipe.id}
                      />

                      <button
                        className="botao-remover"
                      >
                        Remover da competição
                      </button>

                    </form>

                  </article>
                );
              }
            )

          )}

        </div>

      </section>


      <section
        id="grupos"
        className="bloco"
      >

        <div className="titulo-bloco">

          <div>
            <span>
              ORGANIZAÇÃO
            </span>

            <h2>
              Grupos
            </h2>
          </div>

        </div>


        <form
          action={criarGrupo}
          className="form-grupo"
        >

          <input
            type="hidden"
            name="competicao_id"
            value={id}
          />

          <div className="campo">
            <label>
              Nome do grupo
            </label>

            <input
              name="nome"
              placeholder="Ex.: Grupo D"
              required
            />
          </div>


          <div className="campo">
            <label>
              Ordem
            </label>

            <input
              type="number"
              name="ordem"
              min="1"
              defaultValue={
                grupos.length + 1
              }
            />
          </div>


          <div className="campo-botao">
            <button className="botao-principal">
              + Criar grupo
            </button>
          </div>

        </form>


        <div className="grupos-grid">

          {grupos.length === 0 ? (

            <div className="vazio">
              Nenhum grupo criado.
            </div>

          ) : (

            grupos.map(
              (grupo: any) => {

                const integrantes =
                  grupoEquipes.filter(
                    (ge: any) =>
                      ge.grupo_id ===
                      grupo.id
                  );


                const idsIntegrantes =
                  new Set(
                    integrantes.map(
                      (ge: any) =>
                        ge.equipe_id
                    )
                  );


                const disponiveis =
                  equipes.filter(
                    (item: any) =>
                      !idsIntegrantes.has(
                        item.equipe.id
                      )
                  );


                return (
                  <article
                    className="grupo-card"
                    key={grupo.id}
                  >

                    <div className="grupo-cabecalho">

                      <div>
                        <span>
                          GRUPO
                        </span>

                        <h3>
                          {grupo.nome}
                        </h3>
                      </div>

                      <strong>
                        {
                          integrantes.length
                        } equipes
                      </strong>

                    </div>


                    <div className="grupo-lista">

                      {
                        integrantes.length ===
                        0
                          ? (
                            <div className="grupo-vazio">
                              Nenhuma equipe
                              adicionada.
                            </div>
                          )
                          : integrantes.map(
                            (registro: any) => {

                              const equipe =
                                registro.equipe;

                              return (
                                <div
                                  className="grupo-equipe"
                                  key={
                                    registro.id
                                  }
                                >

                                  <div className="mini-escudo">

                                    {
                                      equipe?.logo_url
                                        ? (
                                          <img
                                            src={
                                              equipe.logo_url
                                            }
                                            alt={
                                              equipe.nome
                                            }
                                          />
                                        )
                                        : (
                                          <span>
                                            ⚽
                                          </span>
                                        )
                                    }

                                  </div>

                                  <strong>
                                    {
                                      equipe?.nome
                                    }
                                  </strong>


                                  <form
                                    action={
                                      removerEquipeGrupo
                                    }
                                  >

                                    <input
                                      type="hidden"
                                      name="competicao_id"
                                      value={id}
                                    />

                                    <input
                                      type="hidden"
                                      name="grupo_id"
                                      value={
                                        grupo.id
                                      }
                                    />

                                    <input
                                      type="hidden"
                                      name="equipe_id"
                                      value={
                                        equipe.id
                                      }
                                    />

                                    <button
                                      className="remover-grupo"
                                      title="Remover do grupo"
                                    >
                                      ×
                                    </button>

                                  </form>

                                </div>
                              );
                            }
                          )
                      }

                    </div>


                    {equipes.length > 0 && (

                      <form
                        action={
                          adicionarEquipeGrupo
                        }
                        className="adicionar-grupo"
                      >

                        <input
                          type="hidden"
                          name="competicao_id"
                          value={id}
                        />

                        <input
                          type="hidden"
                          name="grupo_id"
                          value={grupo.id}
                        />

                        <select
                          name="equipe_id"
                          required
                          defaultValue=""
                        >

                          <option
                            value=""
                            disabled
                          >
                            Selecionar equipe
                          </option>

                          {
                            equipes.map(
                              (item: any) => (
                                <option
                                  key={
                                    item.equipe.id
                                  }
                                  value={
                                    item.equipe.id
                                  }
                                >
                                  {
                                    item.equipe.nome
                                  }
                                </option>
                              )
                            )
                          }

                        </select>

                        <button>
                          Adicionar
                        </button>

                      </form>

                    )}

                  </article>
                );
              }
            )

          )}

        </div>

      </section>


      <section
        id="jogos"
        className="bloco"
      >

        <div className="titulo-bloco">

          <div>
            <span>
              CALENDÁRIO
            </span>

            <h2>
              Jogos da competição
            </h2>
          </div>

          <Link
            href="/admin/esportivo/partidas/nova"
            className="botao-link"
          >
            + Nova partida
          </Link>

        </div>


        <div className="jogos">

          {
            partidas.length === 0
              ? (
                <div className="vazio">
                  Nenhuma partida cadastrada
                  nesta competição.
                </div>
              )
              : partidas.map(
                (partida: any) => (
                  <Link
                    key={partida.id}
                    href={
                      `/admin/esportivo/partidas/${partida.id}`
                    }
                    className="jogo"
                  >

                    <div>
                      <span>
                        {
                          partida.rodada ||
                          partida.fase ||
                          "Partida"
                        }
                      </span>

                      <strong>
                        A.D. Cannabrava
                        {" × "}
                        {partida.adversario}
                      </strong>
                    </div>


                    <div className="jogo-data">
                      <strong>
                        {
                          partida.data_jogo ||
                          "Data a definir"
                        }
                      </strong>

                      <span>
                        {
                          partida.horario ||
                          ""
                        }
                      </span>
                    </div>


                    <div className="jogo-status">
                      {
                        partida.status ===
                        "finalizada"
                          ? `${partida.gols_cannabrava ?? 0} × ${partida.gols_adversario ?? 0}`
                          : partida.status
                      }
                    </div>

                  </Link>
                )
              )
          }

        </div>

      </section>


      <section
        id="classificacao"
        className="bloco"
      >

        <div className="titulo-bloco">
          <div>
            <span>
              TABELA
            </span>

            <h2>
              Classificação
            </h2>
          </div>
        </div>


        <div className="aviso-classificacao">

          <strong>
            Próxima etapa
          </strong>

          <p>
            A estrutura das equipes e dos grupos
            já está preparada. No próximo passo
            vamos ligar os confrontos aos times e
            calcular automaticamente pontos,
            vitórias, empates, derrotas,
            gols pró, gols contra e saldo.
          </p>

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
            clamp(16px, 3vw, 42px)
            60px;
          background: #f4f7fb;
          color: #10213b;
        }

        .topo-voltar {
          margin-bottom: 16px;
        }

        .voltar {
          color: #0d5ba8;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .hero {
          display: grid;
          grid-template-columns:
            auto
            minmax(0, 1fr)
            minmax(260px, 340px);
          align-items: center;
          gap: 24px;

          padding: 24px;

          border-radius: 18px;

          background:
            linear-gradient(
              120deg,
              #082e69,
              #0c4e87
            );

          color: white;

          box-shadow:
            0 15px 35px
            rgba(9, 42, 85, .13);
        }

        .logo-competicao {
          width: 112px;
          height: 112px;
          border-radius: 18px;
          background: white;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 10px;
        }

        .logo-competicao img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .sem-logo {
          font-size: 46px;
        }

        .etiqueta {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .13em;
          color: #86efac;
        }

        .hero h1 {
          margin: 6px 0 7px;
          font-size:
            clamp(26px, 3vw, 39px);
          line-height: 1.05;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          font-size: 12px;
          opacity: .82;
        }

        .upload-logo {
          display: flex;
          flex-direction: column;
          gap: 8px;

          padding: 15px;

          border:
            1px solid
            rgba(255,255,255,.16);

          border-radius: 12px;

          background:
            rgba(255,255,255,.07);
        }

        .upload-logo label {
          font-size: 11px;
          font-weight: 800;
        }

        .upload-logo input {
          width: 100%;
          font-size: 11px;
        }

        .upload-logo button,
        .form-logo-equipe button {
          min-height: 34px;
          border: 0;
          border-radius: 7px;
          cursor: pointer;

          font-weight: 800;

          background: #1b9855;
          color: white;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .indicador {
          padding: 16px 18px;
          background: white;
          border: 1px solid #e1e7ef;
          border-radius: 12px;
        }

        .indicador span {
          display: block;
          color: #718096;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .indicador strong {
          display: block;
          margin-top: 5px;
          color: #082e69;
          font-size: 28px;
        }

        .abas {
          position: sticky;
          top: 0;
          z-index: 10;

          display: flex;
          gap: 4px;
          overflow-x: auto;

          margin: 16px 0;

          padding: 8px;

          border: 1px solid #e1e7ef;
          border-radius: 12px;

          background:
            rgba(255,255,255,.96);

          backdrop-filter:
            blur(10px);
        }

        .abas a {
          padding: 9px 13px;
          border-radius: 8px;
          white-space: nowrap;

          color: #42526b;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
        }

        .abas a:hover {
          background: #edf4fb;
          color: #082e69;
        }

        .bloco {
          scroll-margin-top: 80px;

          margin-top: 16px;
          padding: 22px;

          border:
            1px solid
            #e1e7ef;

          border-radius: 15px;

          background: white;
        }

        .titulo-bloco {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;

          margin-bottom: 18px;
        }

        .titulo-bloco span {
          display: block;
          color: #18884d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .titulo-bloco h2 {
          margin: 4px 0 0;
          color: #082e69;
          font-size: 23px;
        }

        .quantidade {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #eaf4ff;
          color: #0a5397;
        }

        .dados-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
        }

        .dado {
          padding: 15px;

          border:
            1px solid
            #e5eaf1;

          border-radius: 10px;

          background: #fafcff;
        }

        .dado span {
          display: block;
          color: #7b8797;
          font-size: 9px;
          font-weight: 800;
        }

        .dado strong {
          display: block;
          margin-top: 5px;
          font-size: 13px;
        }

        .formulario {
          display: grid;
          grid-template-columns:
            2fr
            1fr
            .7fr
            1fr
            .45fr
            1fr
            auto;

          align-items: end;
          gap: 10px;

          margin-bottom: 20px;
          padding: 15px;

          border-radius: 11px;

          background: #f6f9fc;
        }

        .campo {
          min-width: 0;
        }

        .campo label {
          display: block;

          margin-bottom: 5px;

          color: #536174;
          font-size: 9px;
          font-weight: 800;
        }

        .campo input,
        .adicionar-grupo select {
          width: 100%;
          min-height: 37px;

          padding: 0 10px;

          border:
            1px solid
            #ccd6e2;

          border-radius: 7px;

          background: white;
          color: #17263c;
        }

        .botao-principal,
        .botao-link {
          min-height: 37px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0 15px;

          border: 0;
          border-radius: 7px;

          cursor: pointer;

          background: #0b5fa5;
          color: white;

          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
        }

        .equipes-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(260px, 1fr)
            );

          gap: 14px;
        }

        .equipe-card {
          display: flex;
          flex-direction: column;
          gap: 13px;

          padding: 16px;

          border:
            1px solid
            #e1e7ef;

          border-radius: 13px;

          background: #fff;
        }

        .equipe-topo {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .escudo {
          flex: 0 0 72px;

          width: 72px;
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 6px;

          border-radius: 12px;

          background: #f4f7fb;
        }

        .escudo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .escudo span {
          font-size: 29px;
        }

        .equipe-info {
          min-width: 0;
        }

        .equipe-info strong {
          display: block;
          color: #082e69;
          font-size: 15px;
        }

        .equipe-info span,
        .equipe-info small {
          display: block;
          margin-top: 3px;
          color: #7a8798;
          font-size: 10px;
        }

        .form-logo-equipe {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            auto;
          gap: 7px;
        }

        .form-logo-equipe input {
          min-width: 0;
          font-size: 10px;
        }

        .form-logo-equipe button {
          padding: 0 10px;
          font-size: 9px;
        }

        .botao-remover {
          width: 100%;
          min-height: 32px;

          border:
            1px solid
            #f3c7c7;

          border-radius: 7px;

          cursor: pointer;

          background: #fff8f8;
          color: #ac3636;

          font-size: 9px;
          font-weight: 800;
        }

        .form-grupo {
          display: grid;
          grid-template-columns:
            2fr
            .5fr
            auto;

          align-items: end;
          gap: 10px;

          max-width: 620px;

          margin-bottom: 20px;
          padding: 15px;

          border-radius: 11px;

          background: #f6f9fc;
        }

        .grupos-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(280px, 1fr)
            );
          gap: 14px;
        }

        .grupo-card {
          overflow: hidden;

          border:
            1px solid
            #dfe6ef;

          border-radius: 13px;
        }

        .grupo-cabecalho {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 14px 15px;

          background:
            linear-gradient(
              120deg,
              #082e69,
              #0b5b93
            );

          color: white;
        }

        .grupo-cabecalho span {
          font-size: 8px;
          opacity: .7;
        }

        .grupo-cabecalho h3 {
          margin: 2px 0 0;
          font-size: 18px;
        }

        .grupo-cabecalho > strong {
          font-size: 9px;
          opacity: .8;
        }

        .grupo-lista {
          min-height: 80px;
          padding: 9px;
        }

        .grupo-equipe {
          display: grid;
          grid-template-columns:
            auto
            minmax(0,1fr)
            auto;

          align-items: center;
          gap: 9px;

          padding: 7px;

          border-bottom:
            1px solid
            #edf1f5;
        }

        .mini-escudo {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 3px;

          border-radius: 7px;

          background: #f5f7fa;
        }

        .mini-escudo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .grupo-equipe > strong {
          font-size: 11px;
        }

        .remover-grupo {
          width: 25px;
          height: 25px;

          border: 0;
          border-radius: 50%;

          cursor: pointer;

          background: #fff0f0;
          color: #ba3737;

          font-size: 16px;
        }

        .grupo-vazio {
          padding: 20px;
          text-align: center;

          color: #8793a4;
          font-size: 10px;
        }

        .adicionar-grupo {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            auto;

          gap: 7px;

          padding: 10px;

          border-top:
            1px solid
            #e6ebf1;

          background: #f8fafc;
        }

        .adicionar-grupo button {
          border: 0;
          border-radius: 7px;

          cursor: pointer;

          background: #16854b;
          color: white;

          padding: 0 12px;

          font-size: 9px;
          font-weight: 900;
        }

        .jogos {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .jogo {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            auto
            100px;

          align-items: center;
          gap: 15px;

          padding: 13px 15px;

          border:
            1px solid
            #e4e9f0;

          border-radius: 9px;

          color: inherit;
          text-decoration: none;
        }

        .jogo:hover {
          border-color: #9dc6eb;
          background: #f8fbff;
        }

        .jogo > div > span {
          display: block;
          color: #7e8998;
          font-size: 9px;
        }

        .jogo > div > strong {
          display: block;
          margin-top: 2px;
          font-size: 12px;
        }

        .jogo-data {
          text-align: right;
        }

        .jogo-status {
          text-align: center;
          text-transform: uppercase;
          color: #0c5e9f;
          font-size: 10px;
          font-weight: 900;
        }

        .aviso-classificacao {
          padding: 22px;

          border:
            1px dashed
            #a9bfd6;

          border-radius: 12px;

          background: #f7fbff;
        }

        .aviso-classificacao strong {
          color: #0b5a9e;
        }

        .aviso-classificacao p {
          max-width: 800px;
          margin: 7px 0 0;

          color: #657386;
          font-size: 12px;
          line-height: 1.6;
        }

        .vazio {
          padding: 30px;
          border:
            1px dashed
            #ccd6e2;
          border-radius: 10px;

          color: #8491a2;
          text-align: center;
          font-size: 11px;
        }


        @media(max-width:1100px) {

          .hero {
            grid-template-columns:
              auto
              minmax(0,1fr);
          }

          .upload-logo {
            grid-column:
              1 / -1;
          }

          .formulario {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .campo-botao {
            grid-column:
              1 / -1;
          }

          .botao-principal {
            width: 100%;
          }

        }


        @media(max-width:760px) {

          .pagina {
            padding:
              14px
              12px
              40px;
          }

          .hero {
            grid-template-columns:
              82px
              minmax(0,1fr);

            gap: 12px;
            padding: 15px;
          }

          .logo-competicao {
            width: 82px;
            height: 82px;
          }

          .hero h1 {
            font-size: 23px;
          }

          .upload-logo {
            grid-column:
              1 / -1;
          }

          .indicadores {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .dados-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .bloco {
            padding: 15px;
          }

          .formulario {
            grid-template-columns:
              1fr
              1fr;
          }

          .campo-grande {
            grid-column:
              1 / -1;
          }

          .form-grupo {
            grid-template-columns:
              1fr
              .5fr;
          }

          .form-grupo .campo-botao {
            grid-column:
              1 / -1;
          }

          .jogo {
            grid-template-columns:
              1fr
              auto;
          }

          .jogo-status {
            grid-column:
              1 / -1;

            padding-top: 7px;

            border-top:
              1px solid
              #eef2f6;
          }

        }


        @media(max-width:480px) {

          .hero {
            grid-template-columns: 1fr;
          }

          .logo-competicao {
            width: 90px;
            height: 90px;
          }

          .indicadores,
          .dados-grid,
          .formulario,
          .form-grupo {
            grid-template-columns: 1fr;
          }

          .campo-grande,
          .campo-botao {
            grid-column: auto;
          }

          .form-logo-equipe {
            grid-template-columns: 1fr;
          }

          .jogo {
            grid-template-columns: 1fr;
          }

          .jogo-data {
            text-align: left;
          }

        }

      `}</style>

    </main>
  );
}