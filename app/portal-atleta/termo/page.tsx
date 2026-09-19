import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { assinarTermo } from "./actions";
import BotaoImprimir from "./BotaoImprimir";

function formatarData(
  data: string | null | undefined
) {
  if (!data) return "—";

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(
    new Date(data)
  );
}

function statusLabel(
  status: string | null | undefined
) {
  const mapa: Record<string, string> = {
    gerado: "Gerado",
    liberado: "Disponível para assinatura",
    aguardando_assinatura:
      "Aguardando assinatura",
    assinado: "Assinado",
    cancelado: "Cancelado",
  };

  return mapa[status || ""] ||
    status ||
    "Aguardando";
}

export default async function TermoPage() {
  const usuario =
    await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  if (!usuario.atletaId) {
    redirect("/portal-atleta/dados");
  }

  const supabase =
    await createClient();

  const { data: atleta } =
    await supabase
      .from("atletas")
      .select(`
        id,
        nome,
        cpf,
        modalidade,
        posicao,
        status
      `)
      .eq(
        "id",
        usuario.atletaId
      )
      .maybeSingle();

  if (!atleta) {
    redirect("/portal-atleta/dados");
  }

  const {
    data: termo,
    error,
  } = await supabase
    .from("termos_compromisso")
    .select("*")
    .eq(
      "atleta_id",
      atleta.id
    )
    .order(
      "criado_em",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao carregar termo:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );
  }

  const assinado =
    termo?.status === "assinado";

  const disponivel =
    termo &&
    [
      "gerado",
      "liberado",
      "aguardando_assinatura",
    ].includes(
      termo.status
    );

  return (
    <main className="pagina">
      <section className="cabecalho">
        <div>
          <span className="identificador">
            PORTAL DO ATLETA
          </span>

          <h1>
            Termo de Compromisso
          </h1>

          <p>
            Consulte e acompanhe seu vínculo formal
            com a Associação Desportiva Cannabrava.
          </p>
        </div>

        <div
          className={`situacao ${
            assinado
              ? "assinado"
              : ""
          }`}
        >
          <span>STATUS</span>

          <strong>
            {termo
              ? statusLabel(
                  termo.status
                )
              : "Aguardando liberação"}
          </strong>
        </div>
      </section>

      {!termo && (
        <section className="estado-vazio">
          <div className="icone">
            TER
          </div>

          <div>
            <span>
              TERMO DE COMPROMISSO
            </span>

            <h2>
              Ainda não há termo disponível
            </h2>

            <p>
              O Termo de Compromisso será
              disponibilizado após a análise
              cadastral e o vínculo esportivo
              do atleta.
            </p>
          </div>
        </section>
      )}

      {termo && (
        <>
          <section className="acoes-termo">
            <BotaoImprimir />
          </section>

          <section className="resumo-termo">
            <div>
              <span>ATLETA</span>
              <strong>
                {atleta.nome}
              </strong>
            </div>

            <div>
              <span>MODALIDADE</span>
              <strong>
                {atleta.modalidade ||
                  "Futebol"}
              </strong>
            </div>

            <div>
              <span>POSIÇÃO</span>
              <strong>
                {atleta.posicao ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>VERSÃO</span>
              <strong>
                {termo.versao ||
                  termo.version ||
                  "1"}
              </strong>
            </div>
          </section>

          <section className="documento">
            <div className="documento-cabecalho">
              <img
                src="/escudo.png"
                alt="A.D. Cannabrava"
              />

              <div>
                <span>
                  ASSOCIAÇÃO DESPORTIVA CANNABRAVA
                </span>

                <h2>
                  {termo.titulo ||
                    "Termo de Compromisso do Atleta"}
                </h2>

                <small>
                  Documento institucional
                </small>
              </div>
            </div>

            <div className="texto-termo">
              {termo.conteudo ? (
                termo.conteudo
                  .split("\n")
                  .map(
                    (
                      paragrafo: string,
                      indice: number
                    ) => (
                      <p key={indice}>
                        {paragrafo}
                      </p>
                    )
                  )
              ) : (
                <>
                  <p>
                    Declaro que estou ciente das
                    normas, deveres e
                    responsabilidades decorrentes
                    da minha participação nas
                    atividades da Associação
                    Desportiva Cannabrava.
                  </p>

                  <p>
                    Comprometo-me a preservar a
                    imagem da Associação, respeitar
                    seus dirigentes, atletas,
                    comissão técnica, adversários,
                    arbitragem e demais
                    participantes das atividades
                    esportivas.
                  </p>

                  <p>
                    Declaro ainda que as informações
                    e documentos apresentados no meu
                    cadastro são verdadeiros e
                    atualizados.
                  </p>
                </>
              )}
            </div>

            <div className="identificacao">
              <div>
                <span>NOME</span>
                <strong>
                  {atleta.nome}
                </strong>
              </div>

              <div>
                <span>CPF</span>
                <strong>
                  {atleta.cpf || "—"}
                </strong>
              </div>
            </div>

            {assinado && (
              <div className="assinatura-confirmada">
                <div className="check">
                  ✓
                </div>

                <div>
                  <span>
                    ASSINADO ELETRONICAMENTE
                  </span>

                  <strong>
                    Aceite registrado em{" "}
                    {formatarData(
                      termo.assinado_em ||
                        termo.aceite_em
                    )}
                  </strong>

                  <small>
                    O documento não pode mais ser
                    alterado pelo atleta.
                  </small>
                </div>
              </div>
            )}
          </section>

          {disponivel &&
            !assinado && (
              <form
                action={assinarTermo}
                className="aceite"
              >
                <input
                  type="hidden"
                  name="termo_id"
                  value={termo.id}
                />

                <div className="aceite-conteudo">
                  <label>
                    <input
                      type="checkbox"
                      name="aceite"
                      required
                    />

                    <span>
                      Li integralmente este Termo de
                      Compromisso e concordo com suas
                      condições.
                    </span>
                  </label>

                  <p>
                    Ao confirmar, o sistema registrará
                    seu aceite, data e hora da
                    assinatura.
                  </p>
                </div>

                <button type="submit">
                  Aceitar e assinar termo
                </button>
              </form>
            )}

          {assinado && (
            <section className="rodape-assinado">
              <div>
                <span>
                  SITUAÇÃO DO TERMO
                </span>

                <strong>
                  Documento concluído
                </strong>

                <p>
                  Seu Termo de Compromisso está
                  devidamente aceito.
                </p>
              </div>

              <div className="selo">
                ✓ ASSINADO
              </div>
            </section>
          )}
        </>
      )}

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 22px 28px 40px;
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
          min-width: 210px;
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
        }

        .situacao strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 11px;
        }

        .situacao.assinado {
          border-color: #c8ead5;
          background: #eefaf3;
        }

        .situacao.assinado span,
        .situacao.assinado strong {
          color: #168447;
        }

        .acoes-termo {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;
        }

        .estado-vazio {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 30px;
          border: 1px solid #dce5f0;
          border-radius: 14px;
          background: #fff;
        }

        .estado-vazio .icone {
          flex: 0 0 58px;
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #eef5ff;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
        }

        .estado-vazio span {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .07em;
        }

        .estado-vazio h2 {
          margin: 3px 0 5px;
          color: #082e69;
          font-size: 17px;
        }

        .estado-vazio p {
          max-width: 500px;
          margin: 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .resumo-termo {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0,1fr));
          margin-bottom: 11px;
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .resumo-termo div {
          padding: 11px 14px;
          border-right: 1px solid #edf1f5;
        }

        .resumo-termo div:last-child {
          border-right: 0;
        }

        .resumo-termo span,
        .identificacao span {
          display: block;
          color: #94a3b8;
          font-size: 6.5px;
          font-weight: 900;
          letter-spacing: .05em;
        }

        .resumo-termo strong,
        .identificacao strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 9.5px;
        }

        .documento {
          overflow: hidden;
          border: 1px solid #d7e0eb;
          border-radius: 13px;
          background: #fff;
        }

        .documento-cabecalho {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 22px;
          border-bottom: 3px solid #168447;
          background: #082e69;
          color: white;
        }

        .documento-cabecalho img {
          width: 57px;
          height: 57px;
          object-fit: contain;
        }

        .documento-cabecalho span {
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
          opacity: .78;
        }

        .documento-cabecalho h2 {
          margin: 3px 0 2px;
          font-size: 17px;
        }

        .documento-cabecalho small {
          font-size: 7.5px;
          opacity: .65;
        }

        .texto-termo {
          min-height: 300px;
          padding: 28px 40px;
          color: #334155;
          font-size: 11px;
          line-height: 1.75;
          text-align: justify;
        }

        .texto-termo p {
          margin: 0 0 13px;
        }

        .identificacao {
          display: grid;
          grid-template-columns: 1.4fr .6fr;
          gap: 10px;
          padding: 14px 22px;
          border-top: 1px solid #edf1f5;
          background: #f8fafc;
        }

        .assinatura-confirmada {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 22px;
          border-top: 1px solid #c8ead5;
          background: #eefaf3;
        }

        .check {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #168447;
          color: #fff;
          font-size: 16px;
          font-weight: 900;
        }

        .assinatura-confirmada span {
          display: block;
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .assinatura-confirmada strong {
          display: block;
          margin-top: 2px;
          color: #09653a;
          font-size: 10px;
        }

        .assinatura-confirmada small {
          display: block;
          margin-top: 2px;
          color: #5f8d72;
          font-size: 7.5px;
        }

        .aceite {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 11px;
          padding: 15px 17px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #fff;
        }

        .aceite label {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #334155;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .aceite input {
          width: 17px;
          height: 17px;
          margin: 0;
          accent-color: #168447;
        }

        .aceite p {
          margin: 5px 0 0 26px;
          color: #94a3b8;
          font-size: 8px;
        }

        .aceite button {
          flex: 0 0 auto;
          min-height: 42px;
          padding: 0 16px;
          border: 0;
          border-radius: 9px;
          background: #168447;
          color: #fff;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .rodape-assinado {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 11px;
          padding: 13px 16px;
          border: 1px solid #c8ead5;
          border-radius: 12px;
          background: #eefaf3;
        }

        .rodape-assinado span {
          display: block;
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .rodape-assinado strong {
          display: block;
          margin-top: 2px;
          color: #09653a;
          font-size: 10px;
        }

        .rodape-assinado p {
          margin: 2px 0 0;
          color: #5f8d72;
          font-size: 8px;
        }

        .selo {
          padding: 8px 11px;
          border-radius: 8px;
          background: #168447;
          color: white;
          font-size: 8px;
          font-weight: 900;
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

          .resumo-termo {
            grid-template-columns: 1fr 1fr;
          }

          .resumo-termo div {
            border-bottom: 1px solid #edf1f5;
          }

          .documento-cabecalho {
            padding: 14px;
          }

          .documento-cabecalho img {
            width: 47px;
            height: 47px;
          }

          .documento-cabecalho h2 {
            font-size: 14px;
          }

          .texto-termo {
            min-height: 0;
            padding: 20px 16px;
            font-size: 10px;
            line-height: 1.65;
          }

          .identificacao {
            grid-template-columns: 1fr;
            padding: 12px 14px;
          }

          .aceite {
            align-items: stretch;
            flex-direction: column;
          }

          .aceite button {
            width: 100%;
            min-height: 45px;
          }

          .rodape-assinado {
            align-items: flex-start;
            flex-direction: column;
          }

          .estado-vazio {
            align-items: flex-start;
            flex-direction: column;
            min-height: 0;
            padding: 20px;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            background: #fff !important;
          }

          .acoes-termo,
          .cabecalho,
          .resumo-termo,
          .aceite,
          .rodape-assinado {
            display: none !important;
          }

          .pagina {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .documento {
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .documento-cabecalho {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .texto-termo {
            min-height: 0 !important;
            padding: 15mm 12mm 8mm !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
          }

          .identificacao,
          .assinatura-confirmada {
            page-break-inside: avoid;
          }

          .assinatura-confirmada {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}