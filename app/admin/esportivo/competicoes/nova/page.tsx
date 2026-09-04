import Link from "next/link";
import { salvarCompeticao } from "./actions";

export default function NovaCompeticaoPage() {
  const anoAtual = new Date().getFullYear();

  return (
    <main className="pagina">
      <section className="cabecalho">
        <div>
          <span className="identificador">
            GESTÃO ESPORTIVA
          </span>

          <h1>Nova competição</h1>

          <p>
            Cadastre uma competição para organizar partidas,
            convocações, súmulas e estatísticas.
          </p>
        </div>

        <Link
          href="/admin/esportivo/competicoes"
          className="voltar"
        >
          ← Voltar
        </Link>
      </section>

      <form
        action={salvarCompeticao}
        className="formulario"
      >
        <section className="card principal">
          <div className="card-cabecalho">
            <div>
              <span>IDENTIFICAÇÃO</span>
              <h2>Dados da competição</h2>
            </div>
          </div>

          <div className="campos">
            <div className="campo campo-grande">
              <label htmlFor="nome">
                Nome da competição *
              </label>

              <input
                id="nome"
                name="nome"
                required
                placeholder="Ex.: Campeonato Municipal de Canarana"
              />
            </div>

            <div className="campo">
              <label htmlFor="temporada">
                Temporada *
              </label>

              <input
                id="temporada"
                name="temporada"
                required
                defaultValue={String(anoAtual)}
                placeholder="2026"
              />
            </div>

            <div className="campo">
              <label htmlFor="tipo">
                Tipo *
              </label>

              <select
                id="tipo"
                name="tipo"
                required
                defaultValue="Campeonato"
              >
                <option value="Campeonato">
                  Campeonato
                </option>

                <option value="Copa">
                  Copa
                </option>

                <option value="Torneio">
                  Torneio
                </option>

                <option value="Festival">
                  Festival
                </option>

                <option value="Amistoso">
                  Competição amistosa
                </option>

                <option value="Outro">
                  Outro
                </option>
              </select>
            </div>

            <div className="campo">
              <label htmlFor="formato">
                Formato
              </label>

              <select
                id="formato"
                name="formato"
                defaultValue=""
              >
                <option value="">
                  Selecione
                </option>

                <option value="Pontos corridos">
                  Pontos corridos
                </option>

                <option value="Grupos + eliminatórias">
                  Grupos + eliminatórias
                </option>

                <option value="Eliminatória simples">
                  Eliminatória simples
                </option>

                <option value="Eliminatória ida e volta">
                  Eliminatória ida e volta
                </option>

                <option value="Fase classificatória + final">
                  Fase classificatória + final
                </option>

                <option value="Outro">
                  Outro
                </option>
              </select>
            </div>

            <div className="campo campo-grande">
              <label htmlFor="descricao">
                Descrição
              </label>

              <textarea
                id="descricao"
                name="descricao"
                rows={4}
                placeholder="Informações gerais sobre a competição."
              />
            </div>
          </div>
        </section>

        <section className="grade">
          <section className="card">
            <div className="card-cabecalho">
              <div>
                <span>PERÍODO</span>
                <h2>Datas e local</h2>
              </div>
            </div>

            <div className="campos">
              <div className="campo">
                <label htmlFor="data_inicio">
                  Data de início
                </label>

                <input
                  id="data_inicio"
                  name="data_inicio"
                  type="date"
                />
              </div>

              <div className="campo">
                <label htmlFor="data_fim">
                  Data de término
                </label>

                <input
                  id="data_fim"
                  name="data_fim"
                  type="date"
                />
              </div>

              <div className="campo campo-grande">
                <label htmlFor="local_principal">
                  Local principal
                </label>

                <input
                  id="local_principal"
                  name="local_principal"
                  placeholder="Ex.: Estádio Municipal"
                />
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-cabecalho">
              <div>
                <span>ORGANIZAÇÃO</span>
                <h2>Gestão da competição</h2>
              </div>
            </div>

            <div className="campos">
              <div className="campo campo-grande">
                <label htmlFor="organizador">
                  Organizador
                </label>

                <input
                  id="organizador"
                  name="organizador"
                  placeholder="Ex.: Prefeitura Municipal de Canarana"
                />
              </div>

              <div className="campo">
                <label htmlFor="status">
                  Situação *
                </label>

                <select
                  id="status"
                  name="status"
                  required
                  defaultValue="planejamento"
                >
                  <option value="planejamento">
                    Planejamento
                  </option>

                  <option value="prevista">
                    Prevista
                  </option>

                  <option value="em_andamento">
                    Em andamento
                  </option>

                  <option value="finalizada">
                    Finalizada
                  </option>

                  <option value="encerrada">
                    Encerrada
                  </option>

                  <option value="cancelada">
                    Cancelada
                  </option>
                </select>
              </div>
            </div>
          </section>
        </section>

        <section className="card">
          <div className="card-cabecalho">
            <div>
              <span>OBSERVAÇÕES</span>
              <h2>Informações complementares</h2>
            </div>
          </div>

          <div className="campos">
            <div className="campo campo-grande">
              <label htmlFor="observacao">
                Observações
              </label>

              <textarea
                id="observacao"
                name="observacao"
                rows={4}
                placeholder="Registre informações administrativas ou esportivas relevantes."
              />
            </div>
          </div>
        </section>

        <section className="acoes">
          <Link
            href="/admin/esportivo/competicoes"
            className="cancelar"
          >
            Cancelar
          </Link>

          <button type="submit">
            Salvar competição
          </button>
        </section>
      </form>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 24px 28px 40px;
        }

        .cabecalho {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .identificador {
          color: #168447;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .cabecalho h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: 29px;
        }

        .cabecalho p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
        }

        .voltar {
          min-height: 38px;
          display: flex;
          align-items: center;
          padding: 0 13px;
          border: 1px solid #d6e0eb;
          border-radius: 9px;
          color: #082e69;
          background: #fff;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .formulario {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .grade {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .card {
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: #fff;
        }

        .card-cabecalho {
          min-height: 61px;
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #edf1f5;
        }

        .card-cabecalho span {
          color: #168447;
          font-size: 7.5px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .card-cabecalho h2 {
          margin: 2px 0 0;
          color: #082e69;
          font-size: 15px;
        }

        .campos {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 13px;
          padding: 16px;
        }

        .principal .campos {
          grid-template-columns:
            minmax(0, 2fr)
            minmax(150px, .6fr)
            minmax(180px, .7fr);
        }

        .campo {
          min-width: 0;
        }

        .campo-grande {
          grid-column: 1 / -1;
        }

        .campo label {
          display: block;
          margin-bottom: 5px;
          color: #536178;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .035em;
        }

        .campo input,
        .campo select,
        .campo textarea {
          width: 100%;
          border: 1px solid #d6e0eb;
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #334155;
          font-size: 10px;
        }

        .campo input,
        .campo select {
          height: 40px;
          padding: 0 11px;
        }

        .campo textarea {
          padding: 10px 11px;
          resize: vertical;
          line-height: 1.45;
        }

        .campo input:focus,
        .campo select:focus,
        .campo textarea:focus {
          border-color: #1763d6;
          box-shadow: 0 0 0 2px rgba(23, 99, 214, .08);
        }

        .acoes {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 4px;
        }

        .acoes button,
        .cancelar {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 17px;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
        }

        .cancelar {
          border: 1px solid #d6e0eb;
          background: #fff;
          color: #64748b;
        }

        .acoes button {
          border: 0;
          background: #082e69;
          color: #fff;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .grade {
            grid-template-columns: 1fr;
          }

          .principal .campos {
            grid-template-columns: 1fr 1fr;
          }

          .principal .campo:first-child,
          .principal .campo-grande {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 16px 11px 28px;
          }

          .cabecalho {
            display: block;
          }

          .cabecalho h1 {
            font-size: 25px;
          }

          .cabecalho p {
            font-size: 10px;
            line-height: 1.45;
          }

          .voltar {
            width: 100%;
            margin-top: 12px;
            justify-content: center;
          }

          .campos,
          .principal .campos {
            grid-template-columns: 1fr;
            padding: 13px;
          }

          .principal .campo:first-child,
          .principal .campo-grande,
          .campo-grande {
            grid-column: auto;
          }

          .campo input,
          .campo select {
            height: 44px;
            font-size: 11px;
          }

          .campo textarea {
            font-size: 11px;
          }

          .acoes {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .acoes button,
          .cancelar {
            width: 100%;
            min-height: 44px;
          }
        }

        @media (max-width: 390px) {
          .pagina {
            padding-left: 8px;
            padding-right: 8px;
          }

          .acoes {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}