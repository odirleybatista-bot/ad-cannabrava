import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { criarPartida } from "./actions";

export default async function NovaPartidaPage() {
  const supabase =
    await createClient();

  const { data: competicoes } =
    await supabase
      .from("competicoes")
      .select(
        "id,nome,temporada,status"
      )
      .order(
        "nome",
        {
          ascending: true,
        }
      );

  return (
    <main className="pagina">
      <div className="topo">
        <div>
          <Link
            href="/admin/esportivo/partidas"
            className="voltar"
          >
            ← Voltar para partidas
          </Link>

          <span className="rotulo">
            GESTÃO ESPORTIVA
          </span>

          <h1>Nova Partida</h1>

          <p>
            Cadastre uma partida da
            A.D. Cannabrava.
          </p>
        </div>
      </div>

      <form
        action={criarPartida}
        className="formulario"
      >
        <section className="card">
          <div className="card-topo">
            <div>
              <span>
                IDENTIFICAÇÃO
              </span>

              <h2>
                Dados da partida
              </h2>

              <p>
                Informe o tipo,
                adversário e modalidade.
              </p>
            </div>
          </div>

          <div className="grid">
            <CampoSelect
              label="Tipo da partida"
              name="tipo"
              required
              options={[
                {
                  value: "",
                  label:
                    "Selecione",
                },
                {
                  value: "oficial",
                  label:
                    "Jogo Oficial",
                },
                {
                  value: "amistoso",
                  label:
                    "Amistoso",
                },
                {
                  value:
                    "jogo_treino",
                  label:
                    "Jogo-treino",
                },
              ]}
            />

            <Campo
              label="Adversário"
              name="adversario"
              placeholder="Nome do adversário"
              required
            />

            <Campo
              label="Modalidade"
              name="modalidade"
              defaultValue="Futebol"
              required
            />

            <Campo
              label="Temporada"
              name="temporada"
              placeholder="Ex.: 2026"
            />
          </div>
        </section>

        <section className="card">
          <div className="card-topo">
            <div>
              <span>
                COMPETIÇÃO
              </span>

              <h2>
                Vínculo competitivo
              </h2>

              <p>
                Obrigatório apenas para
                jogos oficiais.
              </p>
            </div>
          </div>

          <div className="grid">
            <div className="campo">
              <label htmlFor="competicao_id">
                Competição
              </label>

              <select
                id="competicao_id"
                name="competicao_id"
                defaultValue=""
              >
                <option value="">
                  Sem competição
                </option>

                {(competicoes || []).map(
                  (competicao: any) => (
                    <option
                      key={
                        competicao.id
                      }
                      value={
                        competicao.id
                      }
                    >
                      {competicao.nome}
                      {competicao.temporada
                        ? ` - ${competicao.temporada}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <Campo
              label="Rodada"
              name="rodada"
              placeholder="Ex.: 1ª rodada"
            />

            <Campo
              label="Fase"
              name="fase"
              placeholder="Ex.: Fase de grupos"
            />

            <Campo
              label="Grupo"
              name="grupo"
              placeholder="Ex.: Grupo D"
            />
          </div>
        </section>

        <section className="card">
          <div className="card-topo">
            <div>
              <span>
                AGENDA
              </span>

              <h2>
                Data e local
              </h2>

              <p>
                Defina quando e onde
                será realizada a partida.
              </p>
            </div>
          </div>

          <div className="grid">
            <Campo
              label="Data"
              name="data_jogo"
              type="date"
              required
            />

            <Campo
              label="Horário"
              name="horario"
              type="time"
            />

            <Campo
              label="Local"
              name="local"
              placeholder="Ex.: Estádio Municipal"
            />

            <Campo
              label="Cidade"
              name="cidade"
              placeholder="Ex.: Canarana - BA"
            />

            <CampoSelect
              label="Mando de campo"
              name="mando"
              required
              options={[
                {
                  value:
                    "mandante",
                  label:
                    "Cannabrava mandante",
                },
                {
                  value:
                    "visitante",
                  label:
                    "Cannabrava visitante",
                },
                {
                  value:
                    "neutro",
                  label:
                    "Campo neutro",
                },
              ]}
            />
          </div>
        </section>

        <section className="card">
          <div className="card-topo">
            <div>
              <span>
                OBSERVAÇÕES
              </span>

              <h2>
                Informações adicionais
              </h2>
            </div>
          </div>

          <div className="campo">
            <label htmlFor="observacoes">
              Observações
            </label>

            <textarea
              id="observacoes"
              name="observacoes"
              rows={4}
              placeholder="Informações adicionais sobre a partida..."
            />
          </div>
        </section>

        <div className="acoes">
          <Link
            href="/admin/esportivo/partidas"
            className="cancelar"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="salvar"
          >
            Salvar partida
          </button>
        </div>
      </form>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          padding: 22px 24px 40px;
        }

        .topo {
          margin-bottom: 16px;
        }

        .voltar {
          display: block;
          margin-bottom: 12px;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .rotulo {
          display: block;
          color: #168447;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        h1 {
          margin: 4px 0;
          color: #082e69;
          font-size: 30px;
        }

        .topo p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .formulario {
          display: grid;
          gap: 11px;
        }

        .card {
          padding: 17px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: #fff;
        }

        .card-topo {
          margin-bottom: 15px;
        }

        .card-topo span {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .card-topo h2 {
          margin: 2px 0;
          color: #082e69;
          font-size: 16px;
        }

        .card-topo p {
          margin: 0;
          color: #94a3b8;
          font-size: 9px;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 12px;
        }

        .campo label {
          display: block;
          margin-bottom: 5px;
          color: #475569;
          font-size: 8px;
          font-weight: 900;
        }

        .campo input,
        .campo select,
        .campo textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #fff;
          color: #1e293b;
          outline: none;
          font-size: 10px;
        }

        .campo input,
        .campo select {
          height: 42px;
          padding: 0 10px;
        }

        .campo textarea {
          padding: 10px;
          resize: vertical;
        }

        .campo input:focus,
        .campo select:focus,
        .campo textarea:focus {
          border-color: #1763d6;
          box-shadow:
            0 0 0 3px
            rgba(23,99,214,.08);
        }

        .acoes {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 2px;
        }

        .cancelar,
        .salvar {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .cancelar {
          border: 1px solid #dce5f0;
          background: #fff;
          color: #475569;
        }

        .salvar {
          border: 0;
          background: #082e69;
          color: #fff;
          cursor: pointer;
        }

        @media(max-width:1000px) {
          .grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }
        }

        @media(max-width:600px) {
          .pagina {
            padding: 14px 10px 30px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .acoes {
            flex-direction: column-reverse;
          }

          .cancelar,
          .salvar {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function Campo({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="campo">
      <label htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
      />
    </div>
  );
}

function CampoSelect({
  label,
  name,
  required = false,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="campo">
      <label htmlFor={name}>
        {label}
      </label>

      <select
        id={name}
        name={name}
        required={required}
        defaultValue={
          options[0]?.value || ""
        }
      >
        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}