import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { salvarDadosAtleta } from "./actions";

export default async function MeusDadosPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  const supabase = await createClient();

  let atleta: any = null;

  if (usuario.atletaId) {
    const { data } = await supabase
      .from("atletas")
      .select("*")
      .eq("id", usuario.atletaId)
      .maybeSingle();

    atleta = data;
  }

  const nome =
    atleta?.nome ||
    usuario.nome ||
    "";

  const email =
    atleta?.email ||
    usuario.email ||
    "";

  const nascimento =
    atleta?.data_nascimento ||
    atleta?.nascimento ||
    "";

  const numeroCamisa =
    atleta?.numero_camisa ||
    atleta?.camisa ||
    "";

  const contatoEmergencia =
    atleta?.contato_emergencia ||
    atleta?.emergencia_nome ||
    "";

  const telefoneEmergencia =
    atleta?.telefone_emergencia ||
    atleta?.emergencia_telefone ||
    "";

  return (
    <main className="pagina">
      <section className="cabecalho">
        <div>
          <span className="identificador">
            PORTAL DO ATLETA
          </span>

          <h1>Meus Dados</h1>

          <p>
            Mantenha seus dados pessoais, esportivos e de contato
            sempre atualizados.
          </p>
        </div>

        <div className="situacao">
          <span>CADASTRO</span>
          <strong>
            {atleta
              ? "Dados cadastrados"
              : "Cadastro inicial"}
          </strong>
        </div>
      </section>

      <form
        action={salvarDadosAtleta}
        className="formulario"
      >
        <section className="card destaque">
          <div className="card-cabecalho">
            <div>
              <span>IDENTIFICAÇÃO</span>
              <h2>Dados pessoais</h2>
            </div>

            <small>
              Campos com * são obrigatórios
            </small>
          </div>

          <div className="campos tres">
            <div className="campo campo-duplo">
              <label htmlFor="nome">
                Nome completo *
              </label>

              <input
                id="nome"
                name="nome"
                required
                defaultValue={nome}
                placeholder="Nome completo"
              />
            </div>

            <div className="campo">
              <label htmlFor="apelido">
                Apelido
              </label>

              <input
                id="apelido"
                name="apelido"
                defaultValue={
                  atleta?.apelido || ""
                }
                placeholder="Como é conhecido"
              />
            </div>

            <div className="campo">
              <label htmlFor="cpf">
                CPF *
              </label>

              <input
                id="cpf"
                name="cpf"
                required
                defaultValue={
                  atleta?.cpf || ""
                }
                placeholder="000.000.000-00"
              />
            </div>

            <div className="campo">
              <label htmlFor="rg">
                RG *
              </label>

              <input
                id="rg"
                name="rg"
                required
                defaultValue={
                  atleta?.rg || ""
                }
                placeholder="Documento de identidade"
              />
            </div>

            <div className="campo">
              <label htmlFor="data_nascimento">
                Data de nascimento *
              </label>

              <input
                id="data_nascimento"
                name="data_nascimento"
                type="date"
                required
                defaultValue={nascimento}
              />
            </div>
          </div>
        </section>

        <section className="grade-principal">
          <section className="card">
            <div className="card-cabecalho">
              <div>
                <span>CONTATO</span>
                <h2>Telefone e e-mail</h2>
              </div>
            </div>

            <div className="campos">
              <div className="campo">
                <label htmlFor="telefone">
                  Telefone *
                </label>

                <input
                  id="telefone"
                  name="telefone"
                  required
                  defaultValue={
                    atleta?.telefone || ""
                  }
                  placeholder="(74) 99999-9999"
                />
              </div>

              <div className="campo">
                <label htmlFor="email">
                  E-mail *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={email}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-cabecalho">
              <div>
                <span>LOCALIZAÇÃO</span>
                <h2>Endereço</h2>
              </div>
            </div>

            <div className="campos endereco">
              <div className="campo campo-duplo">
                <label htmlFor="endereco">
                  Endereço *
                </label>

                <input
                  id="endereco"
                  name="endereco"
                  required
                  defaultValue={
                    atleta?.endereco || ""
                  }
                  placeholder="Rua, avenida, povoado..."
                />
              </div>

              <div className="campo">
                <label htmlFor="numero">
                  Número
                </label>

                <input
                  id="numero"
                  name="numero"
                  defaultValue={
                    atleta?.numero || ""
                  }
                  placeholder="S/N"
                />
              </div>

              <div className="campo">
                <label htmlFor="bairro">
                  Bairro / Localidade *
                </label>

                <input
                  id="bairro"
                  name="bairro"
                  required
                  defaultValue={
                    atleta?.bairro || ""
                  }
                />
              </div>

              <div className="campo">
                <label htmlFor="cidade">
                  Município *
                </label>

                <input
                  id="cidade"
                  name="cidade"
                  required
                  defaultValue={
                    atleta?.cidade ||
                    "Canarana"
                  }
                />
              </div>

              <div className="campo">
                <label htmlFor="uf">
                  UF *
                </label>

                <input
                  id="uf"
                  name="uf"
                  required
                  maxLength={2}
                  defaultValue={
                    atleta?.uf || "BA"
                  }
                />
              </div>
            </div>
          </section>
        </section>

        <section className="card esportivo">
          <div className="card-cabecalho">
            <div>
              <span>PERFIL ESPORTIVO</span>
              <h2>Informações do atleta</h2>
            </div>
          </div>

          <div className="campos cinco">
            <div className="campo">
              <label htmlFor="modalidade">
                Modalidade *
              </label>

              <select
                id="modalidade"
                name="modalidade"
                required
                defaultValue={
                  atleta?.modalidade ||
                  "Futebol"
                }
              >
                <option value="Futebol">
                  Futebol
                </option>
              </select>
            </div>

            <div className="campo">
              <label htmlFor="posicao">
                Posição *
              </label>

              <select
                id="posicao"
                name="posicao"
                required
                defaultValue={
                  atleta?.posicao || ""
                }
              >
                <option value="">
                  Selecione
                </option>

                <option value="Goleiro">
                  Goleiro
                </option>

                <option value="Zagueiro">
                  Zagueiro
                </option>

                <option value="Lateral Direito">
                  Lateral Direito
                </option>

                <option value="Lateral Esquerdo">
                  Lateral Esquerdo
                </option>

                <option value="Volante">
                  Volante
                </option>

                <option value="Meia">
                  Meia
                </option>

                <option value="Atacante">
                  Atacante
                </option>
              </select>
            </div>

            <div className="campo">
              <label htmlFor="numero_camisa">
                Nº preferido
              </label>

              <input
                id="numero_camisa"
                name="numero_camisa"
                type="number"
                min="1"
                max="99"
                defaultValue={
                  numeroCamisa
                }
              />
            </div>

            <div className="campo">
              <label htmlFor="pe">
                Pé dominante
              </label>

              <select
                id="pe"
                name="pe"
                defaultValue={
                  atleta?.pe || ""
                }
              >
                <option value="">
                  Não informado
                </option>

                <option value="Direito">
                  Direito
                </option>

                <option value="Esquerdo">
                  Esquerdo
                </option>

                <option value="Ambidestro">
                  Ambidestro
                </option>
              </select>
            </div>

            <div className="campo">
              <label htmlFor="altura">
                Altura
              </label>

              <input
                id="altura"
                name="altura"
                defaultValue={
                  atleta?.altura || ""
                }
                placeholder="Ex.: 1,78"
              />
            </div>

            <div className="campo">
              <label htmlFor="peso">
                Peso
              </label>

              <input
                id="peso"
                name="peso"
                defaultValue={
                  atleta?.peso || ""
                }
                placeholder="Ex.: 75"
              />
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-cabecalho">
            <div>
              <span>SEGURANÇA</span>
              <h2>Contato de emergência</h2>
            </div>
          </div>

          <div className="campos">
            <div className="campo">
              <label htmlFor="contato_emergencia">
                Nome do contato
              </label>

              <input
                id="contato_emergencia"
                name="contato_emergencia"
                defaultValue={
                  contatoEmergencia
                }
                placeholder="Nome completo"
              />
            </div>

            <div className="campo">
              <label htmlFor="telefone_emergencia">
                Telefone
              </label>

              <input
                id="telefone_emergencia"
                name="telefone_emergencia"
                defaultValue={
                  telefoneEmergencia
                }
                placeholder="(74) 99999-9999"
              />
            </div>
          </div>
        </section>

        <section className="rodape-acoes">
          <div>
            <strong>
              Mantenha seus dados atualizados
            </strong>

            <span>
              As informações serão utilizadas na ficha
              cadastral e nos registros esportivos.
            </span>
          </div>

          <button type="submit">
            {atleta
              ? "Salvar alterações"
              : "Salvar e continuar"}
          </button>
        </section>
      </form>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 22px 28px 38px;
        }

        .cabecalho {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 16px;
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

        .situacao {
          min-width: 175px;
          padding: 11px 14px;
          border: 1px solid #cfe0f4;
          border-radius: 11px;
          background: #eef5ff;
        }

        .situacao span {
          display: block;
          color: #1763d6;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .situacao strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 11px;
        }

        .formulario {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .grade-principal {
          display: grid;
          grid-template-columns: .72fr 1.28fr;
          gap: 11px;
        }

        .card {
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: #fff;
        }

        .destaque {
          border-top: 3px solid #1763d6;
        }

        .esportivo {
          border-left: 3px solid #168447;
        }

        .card-cabecalho {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 11px 15px;
          border-bottom: 1px solid #edf1f5;
        }

        .card-cabecalho span {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .card-cabecalho h2 {
          margin: 2px 0 0;
          color: #082e69;
          font-size: 15px;
        }

        .card-cabecalho small {
          color: #94a3b8;
          font-size: 8px;
        }

        .campos {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 12px;
          padding: 15px;
        }

        .campos.tres {
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
        }

        .campos.cinco {
          grid-template-columns:
            repeat(6, minmax(0, 1fr));
        }

        .campo-duplo {
          grid-column: span 2;
        }

        .campo {
          min-width: 0;
        }

        .campo label {
          display: block;
          margin-bottom: 5px;
          color: #536178;
          font-size: 7.5px;
          font-weight: 900;
          letter-spacing: .025em;
        }

        .campo input,
        .campo select {
          width: 100%;
          height: 39px;
          padding: 0 10px;
          border: 1px solid #d6e0eb;
          border-radius: 8px;
          outline: 0;
          background: #fff;
          color: #334155;
          font-size: 9.5px;
        }

        .campo input:focus,
        .campo select:focus {
          border-color: #1763d6;
          box-shadow: 0 0 0 2px
            rgba(23, 99, 214, .07);
        }

        .rodape-acoes {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 15px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .rodape-acoes strong {
          display: block;
          color: #082e69;
          font-size: 10px;
        }

        .rodape-acoes span {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 8px;
        }

        .rodape-acoes button {
          min-width: 160px;
          min-height: 41px;
          padding: 0 15px;
          border: 0;
          border-radius: 9px;
          background: #082e69;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 1000px) {
          .grade-principal {
            grid-template-columns: 1fr;
          }

          .campos.cinco {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 15px 11px 28px;
          }

          .cabecalho {
            display: block;
          }

          .cabecalho h1 {
            font-size: 24px;
          }

          .cabecalho p {
            font-size: 9.5px;
            line-height: 1.45;
          }

          .situacao {
            width: 100%;
            margin-top: 11px;
          }

          .card-cabecalho {
            min-height: 54px;
            padding: 10px 12px;
          }

          .card-cabecalho small {
            display: none;
          }

          .campos,
          .campos.tres,
          .campos.cinco,
          .campos.endereco {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .campo-duplo {
            grid-column: auto;
          }

          .campo input,
          .campo select {
            height: 44px;
            font-size: 11px;
          }

          .rodape-acoes {
            align-items: stretch;
            flex-direction: column;
          }

          .rodape-acoes button {
            width: 100%;
            min-height: 45px;
          }
        }
      `}</style>
    </main>
  );
}