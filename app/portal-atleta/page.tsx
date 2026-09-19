import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";

function rotuloStatus(status: string | null | undefined) {
  const mapa: Record<string, string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados: "Documentos enviados",
    em_analise: "Em análise",
    correcao_solicitada: "Correção solicitada",
    aprovado: "Aprovado",
    vinculado: "Vinculado",
    termo_liberado: "Termo liberado",
    ativo: "Atleta ativo",
    enviado: "Enviado",
    aguardando_assinatura: "Aguardando assinatura",
    assinado: "Assinado",
    gerado: "Gerado",
  };

  return mapa[status || ""] || status || "Pendente";
}

function saudacao() {
  const hora = new Date().getHours();

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function PortalAtletaPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  if (!usuario.atletaId) {
    redirect("/portal-atleta/dados");
  }

  const supabase = await createClient();

  const { data: atleta } = await supabase
    .from("atletas")
    .select(`
      id,
      nome,
      apelido,
      modalidade,
      posicao,
      numero_camisa,
      status,
      data_nascimento,
      telefone,
      email,
      cidade,
      uf
    `)
    .eq("id", usuario.atletaId)
    .maybeSingle();

  if (!atleta) {
    redirect("/portal-atleta/dados");
  }

  const { data: documentos } = await supabase
    .from("atleta_documentos")
    .select(`
      id,
      tipo,
      status
    `)
    .eq("atleta_id", atleta.id);

  const { data: vinculo } = await supabase
    .from("atleta_vinculos")
    .select(`
      id,
      modalidade,
      temporada,
      data_inicio,
      data_fim,
      status
    `)
    .eq("atleta_id", atleta.id)
    .order("criado_em", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  const { data: termo } = await supabase
    .from("termos_compromisso")
    .select(`
      id,
      status,
      titulo,
      assinado_em
    `)
    .eq("atleta_id", atleta.id)
    .order("criado_em", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  let notificacoesNaoLidas = 0;

  if (usuario.usuarioId) {
    const { count } = await supabase
      .from("notificacoes")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("usuario_id", usuario.usuarioId)
      .eq("lida", false);

    notificacoesNaoLidas = count || 0;
  }

  const obrigatorios = [
    "foto_3x4",
    "identidade",
    "residencia",
    "eleitoral",
  ];

  const documentosEnviados =
    obrigatorios.filter((tipo) =>
      documentos?.some(
        (documento) =>
          documento.tipo === tipo &&
          documento.status !== "pendente"
      )
    ).length;

  const documentosAprovados =
    obrigatorios.filter((tipo) =>
      documentos?.some(
        (documento) =>
          documento.tipo === tipo &&
          documento.status === "aprovado"
      )
    ).length;

  const temCorrecao =
    documentos?.some(
      (documento) =>
        documento.status === "correcao_solicitada"
    ) || false;

  const cadastroCompleto = Boolean(atleta.id);
  const docsCompletos = documentosEnviados === 4;
  const possuiVinculo = Boolean(vinculo);
  const termoAssinado = termo?.status === "assinado";

  const etapasConcluidas = [
    cadastroCompleto,
    docsCompletos,
    possuiVinculo,
    termoAssinado,
  ].filter(Boolean).length;

  const progresso = etapasConcluidas * 25;

  let proximaAcao = {
    titulo: "Cadastro concluído",
    descricao:
      "Seu cadastro está atualizado. Continue acompanhando seu portal.",
    href: "/portal-atleta/dados",
    botao: "Ver meus dados",
  };

  if (!docsCompletos) {
    proximaAcao = {
      titulo: "Envie seus documentos",
      descricao:
        "Complete o envio dos documentos obrigatórios para análise da associação.",
      href: "/portal-atleta/documentos",
      botao: "Enviar documentos",
    };
  } else if (temCorrecao) {
    proximaAcao = {
      titulo: "Documento precisa de correção",
      descricao:
        "Existe uma solicitação de correção. Acesse seus documentos para verificar.",
      href: "/portal-atleta/documentos",
      botao: "Ver correção",
    };
  } else if (!possuiVinculo) {
    proximaAcao = {
      titulo: "Aguardando vínculo esportivo",
      descricao:
        "Seus dados estão em análise. A administração realizará o vínculo com a modalidade e temporada.",
      href: "/portal-atleta/historico",
      botao: "Acompanhar situação",
    };
  } else if (termo && !termoAssinado) {
    proximaAcao = {
      titulo: "Termo disponível",
      descricao:
        "Seu Termo de Compromisso está disponível para leitura e aceite.",
      href: "/portal-atleta/termo",
      botao: "Ver termo",
    };
  }

  return (
    <main className="pagina">
      <section className="boas-vindas">
        <div>
          <span className="secao">PORTAL DO ATLETA</span>

          <h1>
            {saudacao()}, {atleta.apelido || atleta.nome.split(" ")[0]}!
          </h1>

          <p>
            Acompanhe seu cadastro, documentos e situação junto à
            Associação Desportiva Cannabrava.
          </p>
        </div>

        <div className={`status-geral status-${atleta.status}`}>
          <span>SITUAÇÃO</span>
          <strong>{rotuloStatus(atleta.status)}</strong>
        </div>
      </section>

      <section className="painel-superior">
        <div className="perfil-resumo">
          <div className="avatar">
            {atleta.nome
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((nome: string) => nome[0])
              .join("")
              .toUpperCase()}
          </div>

          <div className="perfil-info">
            <span className="rotulo">ATLETA</span>

            <h2>{atleta.nome}</h2>

            <div className="dados-esportivos">
              <span>{atleta.modalidade || "Futebol"}</span>

              <i />

              <span>{atleta.posicao || "Posição não informada"}</span>

              {atleta.numero_camisa && (
                <>
                  <i />
                  <span>Camisa {atleta.numero_camisa}</span>
                </>
              )}
            </div>
          </div>

          <Link
            href="/portal-atleta/dados"
            className="editar"
          >
            Meus dados
          </Link>
        </div>

        <div className="progresso-box">
          <div className="progresso-topo">
            <div>
              <span>PROGRESSO CADASTRAL</span>
              <strong>{progresso}%</strong>
            </div>

            <small>
              {etapasConcluidas} de 4 etapas
            </small>
          </div>

          <div className="barra">
            <div
              className="barra-preenchida"
              style={{
                width: `${progresso}%`,
              }}
            />
          </div>

          <div className="etapas">
            <div className={cadastroCompleto ? "ok" : ""}>
              <b>1</b>
              <span>Cadastro</span>
            </div>

            <div className={docsCompletos ? "ok" : ""}>
              <b>2</b>
              <span>Documentos</span>
            </div>

            <div className={possuiVinculo ? "ok" : ""}>
              <b>3</b>
              <span>Vínculo</span>
            </div>

            <div className={termoAssinado ? "ok" : ""}>
              <b>4</b>
              <span>Termo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="indicadores">
        <Link
          href="/portal-atleta/documentos"
          className="indicador"
        >
          <div className="icone documento">
            DOC
          </div>

          <div>
            <span>Documentos</span>

            <strong>
              {documentosEnviados} de 4
            </strong>

            <small>
              {documentosAprovados} aprovado
              {documentosAprovados === 1 ? "" : "s"}
            </small>
          </div>
        </Link>

        <Link
          href="/portal-atleta/termo"
          className="indicador"
        >
          <div className="icone termo">
            TER
          </div>

          <div>
            <span>Termo</span>

            <strong>
              {termo
                ? rotuloStatus(termo.status)
                : "Aguardando"}
            </strong>

            <small>
              Termo de compromisso
            </small>
          </div>
        </Link>

        <Link
          href="/portal-atleta/convocacoes"
          className="indicador"
        >
          <div className="icone convocacao">
            JOG
          </div>

          <div>
            <span>Convocações</span>
            <strong>Partidas</strong>
            <small>
              Veja e responda suas convocações
            </small>
          </div>
        </Link>

        <Link
          href="/portal-atleta/desempenho"
          className="indicador"
        >
          <div className="icone desempenho">
            EST
          </div>

          <div>
            <span>Desempenho</span>

            <strong>Estatísticas</strong>

            <small>
              Jogos, gols e participação
            </small>
          </div>
        </Link>

        <Link
          href="/portal-atleta/notificacoes"
          className="indicador"
        >
          <div className="icone notificacao">
            NOT
          </div>

          <div>
            <span>Notificações</span>

            <strong>{notificacoesNaoLidas}</strong>

            <small>
              não lida
              {notificacoesNaoLidas === 1 ? "" : "s"}
            </small>
          </div>
        </Link>
      </section>

      <section className="conteudo">
        <div className="proxima-acao">
          <div className="titulo-card">
            <div>
              <span>PRÓXIMO PASSO</span>
              <h3>{proximaAcao.titulo}</h3>
            </div>
          </div>

          <p>{proximaAcao.descricao}</p>

          <Link
            href={proximaAcao.href}
            className="botao-principal"
          >
            {proximaAcao.botao}
          </Link>
        </div>

        <div className="situacao">
          <div className="titulo-card">
            <div>
              <span>SITUAÇÃO ATUAL</span>
              <h3>Cadastro esportivo</h3>
            </div>
          </div>

          <div className="linha-situacao">
            <span>Documentação</span>

            <strong>
              {temCorrecao
                ? "Correção solicitada"
                : documentosAprovados === 4
                ? "Aprovada"
                : docsCompletos
                ? "Em análise"
                : "Pendente"}
            </strong>
          </div>

          <div className="linha-situacao">
            <span>Vínculo esportivo</span>

            <strong>
              {vinculo
                ? `${vinculo.modalidade} • ${vinculo.temporada}`
                : "Aguardando"}
            </strong>
          </div>

          <div className="linha-situacao">
            <span>Termo de compromisso</span>

            <strong>
              {termo
                ? rotuloStatus(termo.status)
                : "Não gerado"}
            </strong>
          </div>

          <div className="linha-situacao">
            <span>Status do atleta</span>

            <strong className="destaque-status">
              {rotuloStatus(atleta.status)}
            </strong>
          </div>
        </div>
      </section>

      <section className="atalhos">
        <Link href="/portal-atleta/dados">
          <strong>Meus Dados</strong>
          <span>Consulte e mantenha seus dados atualizados.</span>
        </Link>

        <Link href="/portal-atleta/documentos">
          <strong>Documentos</strong>
          <span>Envie e acompanhe a análise dos documentos.</span>
        </Link>

        <Link href="/portal-atleta/convocacoes">
          <strong>Convocações</strong>
          <span>Veja os jogos e confirme sua disponibilidade.</span>
        </Link>

        <Link href="/portal-atleta/historico">
          <strong>Histórico</strong>
          <span>Acompanhe as movimentações do seu cadastro.</span>
        </Link>

        <Link href="/portal-atleta/notificacoes">
          <strong>Notificações</strong>
          <span>Veja os comunicados enviados pela associação.</span>
        </Link>
      </section>

      <style>{`
        .pagina {
          max-width: 1650px;
          margin: 0 auto;
          padding: 22px 30px 36px;
        }

        .boas-vindas {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 16px;
        }

        .secao {
          color: #1763d6;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .boas-vindas h1 {
          margin: 3px 0 3px;
          color: #082e69;
          font-size: 30px;
          line-height: 1.1;
        }

        .boas-vindas p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .status-geral {
          min-width: 180px;
          padding: 11px 15px;
          border: 1px solid #cfe0f4;
          border-radius: 12px;
          background: #eef5ff;
        }

        .status-geral span {
          display: block;
          color: #1763d6;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .07em;
        }

        .status-geral strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 15px;
        }

        .status-ativo {
          background: #eefbf3;
          border-color: #c5ebd3;
        }

        .status-ativo span,
        .status-ativo strong {
          color: #087442;
        }

        .painel-superior {
          display: grid;
          grid-template-columns: 1.25fr .75fr;
          gap: 13px;
          margin-bottom: 13px;
        }

        .perfil-resumo,
        .progresso-box {
          background: #ffffff;
          border: 1px solid #dce5f0;
          border-radius: 14px;
        }

        .perfil-resumo {
          min-height: 118px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px 18px;
        }

        .avatar {
          flex: 0 0 62px;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #0a3978,
            #1763d6
          );
          color: #ffffff;
          font-size: 20px;
          font-weight: 900;
        }

        .perfil-info {
          flex: 1;
          min-width: 0;
        }

        .rotulo {
          color: #168447;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .perfil-info h2 {
          margin: 2px 0 5px;
          color: #082e69;
          font-size: 21px;
        }

        .dados-esportivos {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          color: #64748b;
          font-size: 11px;
        }

        .dados-esportivos i {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #94a3b8;
        }

        .editar {
          flex: 0 0 auto;
          padding: 9px 13px;
          border: 1px solid #cbd8e8;
          border-radius: 9px;
          color: #082e69;
          background: #ffffff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
        }

        .progresso-box {
          padding: 16px 18px;
        }

        .progresso-topo {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .progresso-topo span {
          display: block;
          color: #64748b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .progresso-topo strong {
          display: block;
          margin-top: 2px;
          color: #082e69;
          font-size: 23px;
        }

        .progresso-topo small {
          color: #94a3b8;
          font-size: 9px;
        }

        .barra {
          width: 100%;
          height: 7px;
          margin: 9px 0 12px;
          overflow: hidden;
          border-radius: 999px;
          background: #edf1f6;
        }

        .barra-preenchida {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #1763d6,
            #168447
          );
        }

        .etapas {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
        }

        .etapas div {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          font-size: 8.5px;
          font-weight: 700;
        }

        .etapas b {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eef2f7;
          color: #94a3b8;
          font-size: 8px;
        }

        .etapas .ok {
          color: #168447;
        }

        .etapas .ok b {
          background: #e7f7ee;
          color: #168447;
        }

        .indicadores {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 13px;
        }

        .indicador {
          min-height: 88px;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          text-decoration: none;
        }

        .indicador:hover {
          border-color: #afc2d9;
        }

        .icone {
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 900;
        }

        .documento {
          background: #eaf2ff;
          color: #1763d6;
        }

        .termo {
          background: #edf8f1;
          color: #168447;
        }

        .convocacao {
          background: #e9f8ef;
          color: #168447;
        }

        .desempenho {
          background: #f5f0ff;
          color: #7142b8;
        }

        .notificacao {
          background: #fff5e8;
          color: #b96900;
        }

        .indicador span {
          display: block;
          color: #64748b;
          font-size: 10px;
        }

        .indicador strong {
          display: block;
          margin-top: 2px;
          color: #082e69;
          font-size: 14px;
        }

        .indicador small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        .conteudo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
          margin-bottom: 13px;
        }

        .proxima-acao,
        .situacao {
          padding: 17px 18px;
          background: #ffffff;
          border: 1px solid #dce5f0;
          border-radius: 14px;
        }

        .proxima-acao {
          border-left: 4px solid #1763d6;
        }

        .titulo-card span {
          color: #1763d6;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .07em;
        }

        .titulo-card h3 {
          margin: 2px 0 0;
          color: #082e69;
          font-size: 17px;
        }

        .proxima-acao p {
          max-width: 620px;
          margin: 9px 0 13px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .botao-principal {
          display: inline-flex;
          padding: 9px 13px;
          border-radius: 9px;
          background: #082e69;
          color: #ffffff;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .linha-situacao {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #eef2f7;
          font-size: 10px;
        }

        .linha-situacao:last-child {
          border-bottom: 0;
        }

        .linha-situacao span {
          color: #64748b;
        }

        .linha-situacao strong {
          color: #334155;
          text-align: right;
        }

        .destaque-status {
          color: #168447 !important;
        }

        .atalhos {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .atalhos a {
          padding: 13px 14px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #ffffff;
          text-decoration: none;
        }

        .atalhos strong {
          display: block;
          color: #082e69;
          font-size: 12px;
        }

        .atalhos span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 9px;
          line-height: 1.4;
        }

        @media (max-width: 1050px) {
          .painel-superior,
          .conteudo {
            grid-template-columns: 1fr;
          }

          .indicadores,
          .atalhos {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 16px 14px 28px;
          }

          .boas-vindas {
            align-items: flex-start;
            flex-direction: column;
          }

          .boas-vindas h1 {
            font-size: 25px;
          }

          .status-geral {
            width: 100%;
          }

          .perfil-resumo {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .avatar {
            flex-basis: 52px;
            width: 52px;
            height: 52px;
            font-size: 17px;
          }

          .editar {
            width: 100%;
            text-align: center;
          }

          .etapas {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 8px;
          }

          .indicadores,
          .atalhos {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .indicador {
            min-height: 80px;
            padding: 11px;
          }
        }
      `}</style>
    </main>
  );
}