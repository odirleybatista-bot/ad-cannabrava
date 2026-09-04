import Link from "next/link";
import { salvarPatrocinador } from "./actions";

const planosFixos = [
  "Básico",
  "Intermediário",
  "Plus",
  "Premium",
];

const planosPontuais = [
  "Ouro",
  "Prata",
  "Bronze",
  "Apoiador",
];

export default async function NovoPatrocinadorPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    plano?: string;
  }>;
}) {
  const params =
    await searchParams;

  const tipoInicial =
    params.tipo === "pontual"
      ? "pontual"
      : "fixo";

  const planoInicial =
    params.plano || "";

  return (
    <main className="pagina">
      <div className="cabecalho">
        <div>
          <Link
            href="/admin/financeiro/patrocinadores"
            className="voltar"
          >
            ← Patrocinadores
          </Link>

          <h1>
            Novo Patrocinador
          </h1>

          <p>
            Cadastre os dados do parceiro e as condições negociadas.
          </p>
        </div>
      </div>

      <form
        action={salvarPatrocinador}
        className="formulario"
      >
        <section className="bloco">
          <div className="titulo-bloco">
            <h2>
              Dados do patrocinador
            </h2>

            <p>
              Identificação da empresa, pessoa ou entidade parceira.
            </p>
          </div>

          <div className="grade grade-2">
            <Campo
              titulo="Nome / Razão social *"
              nome="nome"
              obrigatorio
            />

            <Campo
              titulo="Nome fantasia"
              nome="nome_fantasia"
            />

            <Campo
              titulo="CPF / CNPJ"
              nome="cpf_cnpj"
            />

            <Campo
              titulo="Telefone"
              nome="telefone"
            />

            <Campo
              titulo="E-mail"
              nome="email"
              tipo="email"
            />

            <Campo
              titulo="Instagram"
              nome="instagram"
              placeholder="@empresa"
            />
          </div>
        </section>

        <section className="bloco">
          <div className="titulo-bloco">
            <h2>
              Modalidade do patrocínio
            </h2>

            <p>
              Defina se o apoio será contínuo ou destinado a uma ação específica.
            </p>
          </div>

          <div className="grade grade-2">
            <label>
              Tipo de patrocínio *

              <select
                name="tipo"
                defaultValue={
                  tipoInicial
                }
                required
              >
                <option value="fixo">
                  Patrocínio Fixo
                </option>

                <option value="pontual">
                  Patrocínio Pontual
                </option>
              </select>
            </label>

            <label>
              Plano / Categoria *

              <select
                name="plano"
                defaultValue={
                  planoInicial
                }
                required
              >
                <option value="">
                  Selecione
                </option>

                <optgroup label="Patrocínios Fixos">
                  {planosFixos.map(
                    (plano) => (
                      <option
                        key={plano}
                        value={plano}
                      >
                        {plano}
                      </option>
                    )
                  )}
                </optgroup>

                <optgroup label="Patrocínios Pontuais">
                  {planosPontuais.map(
                    (plano) => (
                      <option
                        key={plano}
                        value={plano}
                      >
                        {plano}
                      </option>
                    )
                  )}
                </optgroup>
              </select>
            </label>
          </div>
        </section>

        <section className="bloco">
          <div className="titulo-bloco">
            <h2>
              Condições negociadas
            </h2>

            <p>
              Informações internas da parceria. O valor não será exibido na apresentação pública dos planos.
            </p>
          </div>

          <div className="grade grade-4">
            <Campo
              titulo="Valor negociado"
              nome="valor_negociado"
              placeholder="0,00"
            />

            <Campo
              titulo="Data de início"
              nome="data_inicio"
              tipo="date"
            />

            <Campo
              titulo="Data de término"
              nome="data_fim"
              tipo="date"
            />

            <Campo
              titulo="Dia de vencimento"
              nome="dia_vencimento"
              tipo="number"
              placeholder="Ex.: 10"
            />
          </div>

          <div className="grade grade-2 espacamento">
            <label>
              Finalidade / ação patrocinada

              <textarea
                name="finalidade"
                rows={3}
                placeholder="Ex.: Campeonato Municipal 2026, uniformes, evento específico..."
              />
            </label>

            <label>
              Benefícios adicionais negociados

              <textarea
                name="beneficios_adicionais"
                rows={3}
                placeholder="Registre benefícios extras acordados com o patrocinador."
              />
            </label>
          </div>
        </section>

        <section className="bloco">
          <div className="titulo-bloco">
            <h2>
              Controle administrativo
            </h2>
          </div>

          <div className="grade grade-2">
            <label>
              Status

              <select
                name="status"
                defaultValue="ativo"
              >
                <option value="ativo">
                  Ativo
                </option>

                <option value="previsto">
                  Previsto
                </option>

                <option value="suspenso">
                  Suspenso
                </option>

                <option value="encerrado">
                  Encerrado
                </option>

                <option value="cancelado">
                  Cancelado
                </option>
              </select>
            </label>

            <label>
              Observações

              <textarea
                name="observacao"
                rows={3}
                placeholder="Informações internas sobre a negociação."
              />
            </label>
          </div>
        </section>

        <div className="acoes">
          <Link
            href="/admin/financeiro/patrocinadores"
            className="cancelar"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="salvar"
          >
            Salvar patrocinador
          </button>
        </div>
      </form>

      <style>{`
        .pagina {
          max-width: 1450px;
          margin: 0 auto;
          padding: 22px 30px 40px;
        }

        .cabecalho {
          margin-bottom: 16px;
        }

        .voltar {
          color: #1763d6;
          text-decoration: none;
          font-size: 12px;
        }

        .cabecalho h1 {
          margin: 6px 0 3px;
          color: #082e69;
          font-size: 30px;
        }

        .cabecalho p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .formulario {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .bloco {
          background: #ffffff;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          padding: 18px;
        }

        .titulo-bloco {
          margin-bottom: 14px;
        }

        .titulo-bloco h2 {
          margin: 0;
          color: #082e69;
          font-size: 16px;
        }

        .titulo-bloco p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .grade {
          display: grid;
          gap: 12px;
        }

        .grade-2 {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .grade-4 {
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
        }

        .espacamento {
          margin-top: 12px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          padding: 0 11px;
          color: #334155;
          font-family: inherit;
          font-size: 13px;
          outline: none;
        }

        input,
        select {
          height: 42px;
        }

        textarea {
          padding-top: 10px;
          resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #1763d6;
          box-shadow:
            0 0 0 3px rgba(23, 99, 214, .07);
        }

        .acoes {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .cancelar,
        .salvar {
          min-height: 42px;
          padding: 0 18px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .cancelar {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          text-decoration: none;
        }

        .salvar {
          border: 0;
          background: #082e69;
          color: #ffffff;
          cursor: pointer;
        }

        @media (max-width: 1000px) {
          .grade-4 {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 18px 15px 30px;
          }

          .grade-2,
          .grade-4 {
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
  titulo,
  nome,
  tipo = "text",
  placeholder,
  obrigatorio = false,
}: {
  titulo: string;
  nome: string;
  tipo?: string;
  placeholder?: string;
  obrigatorio?: boolean;
}) {
  return (
    <label>
      {titulo}

      <input
        type={tipo}
        name={nome}
        placeholder={placeholder}
        required={obrigatorio}
      />
    </label>
  );
}