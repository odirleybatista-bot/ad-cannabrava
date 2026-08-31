"use client";

import { useState } from "react";

type DocumentoStatus =
  | "Pendente"
  | "Enviado"
  | "Em anÃƒÂ¡lise"
  | "Aprovado"
  | "CorreÃƒÂ§ÃƒÂ£o solicitada";

type Documento = {
  id: string;
  titulo: string;
  descricao: string;
  status: DocumentoStatus;
  tse?: boolean;
};

const documentosIniciais: Documento[] = [
  {
    id: "identidade",
    titulo: "Documento de Identidade",
    descricao: "Envie RG, CNH ou outro documento oficial com foto.",
    status: "Pendente",
  },
  {
    id: "residencia",
    titulo: "Comprovante de ResidÃƒÂªncia",
    descricao: "Envie um comprovante de residÃƒÂªncia recente.",
    status: "Pendente",
  },
  {
    id: "eleitoral",
    titulo: "CertidÃƒÂ£o de QuitaÃƒÂ§ÃƒÂ£o Eleitoral",
    descricao:
      "Documento que comprova a regularidade do atleta perante a JustiÃƒÂ§a Eleitoral.",
    status: "Pendente",
    tse: true,
  },
];

export default function DocumentosPage() {
  const [documentos, setDocumentos] =
    useState<Documento[]>(documentosIniciais);

  function selecionarArquivo(
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    setDocumentos((atuais) =>
      atuais.map((documento) =>
        documento.id === id
          ? {
              ...documento,
              status: "Enviado",
            }
          : documento
      )
    );
  }

  const enviados = documentos.filter(
    (documento) => documento.status !== "Pendente"
  ).length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#08265a]">
            Documentos
          </h1>

          <p className="mt-1 text-slate-500">
            Envie os documentos necessÃƒÂ¡rios para anÃƒÂ¡lise do seu cadastro.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Documentos enviados
          </p>

          <p className="mt-1 text-xl font-black text-[#08265a]">
            {enviados} de {documentos.length}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-900">
          OrientaÃƒÂ§ÃƒÂµes
        </h2>

        <p className="mt-1 text-sm leading-6 text-amber-800">
          Envie arquivos legÃƒÂ­veis e completos. ApÃƒÂ³s o envio, os documentos
          passarÃƒÂ£o por anÃƒÂ¡lise da A.D. Cannabrava. Caso seja necessÃƒÂ¡ria alguma
          correÃƒÂ§ÃƒÂ£o, vocÃƒÂª serÃƒÂ¡ informado pelo portal.
        </p>
      </div>

      <div className="space-y-5">
        {documentos.map((documento) => (
          <article
            key={documento.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#08265a]/10 text-xl">
                    Ã°Å¸â€œâ€ž
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#08265a]">
                      {documento.titulo}
                    </h2>

                    <Status status={documento.status} />
                  </div>

                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
                  {documento.descricao}
                </p>

                {documento.tse && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm text-slate-700">
                      Ainda nÃƒÂ£o possui a certidÃƒÂ£o? VocÃƒÂª pode emitir o documento
                      gratuitamente no portal oficial da JustiÃƒÂ§a Eleitoral.
                    </p>

                    <a
                      href="https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral#/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#08265a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b3478]"
                    >
                      Emitir certidÃƒÂ£o no TSE
                      <span aria-hidden="true">Ã¢â€ â€”</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="w-full shrink-0 xl:w-[250px]">
                <label
                  htmlFor={`arquivo-${documento.id}`}
                  className="flex h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-[#08265a] px-5 text-sm font-bold text-[#08265a] transition hover:bg-blue-50"
                >
                  {documento.status === "Pendente"
                    ? "Selecionar arquivo"
                    : "Substituir arquivo"}
                </label>

                <input
                  id={`arquivo-${documento.id}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    selecionarArquivo(documento.id, event)
                  }
                  className="hidden"
                />

                <p className="mt-2 text-center text-xs text-slate-400">
                  PDF, JPG ou PNG
                </p>
              </div>

            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold text-[#08265a]">
              SituaÃƒÂ§ÃƒÂ£o da documentaÃƒÂ§ÃƒÂ£o
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              O cadastro seguirÃƒÂ¡ para anÃƒÂ¡lise apÃƒÂ³s o envio dos documentos
              obrigatÃƒÂ³rios.
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600">
            {enviados === documentos.length
              ? "DocumentaÃƒÂ§ÃƒÂ£o enviada"
              : "Aguardando documentos"}
          </div>

        </div>
      </div>

    </div>
  );
}

function Status({
  status,
}: {
  status: DocumentoStatus;
}) {
  const estilos: Record<DocumentoStatus, string> = {
    Pendente:
      "bg-slate-100 text-slate-600",
    Enviado:
      "bg-blue-100 text-blue-700",
    "Em anÃƒÂ¡lise":
      "bg-amber-100 text-amber-700",
    Aprovado:
      "bg-emerald-100 text-emerald-700",
    "CorreÃƒÂ§ÃƒÂ£o solicitada":
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${estilos[status]}`}
    >
      {status}
    </span>
  );
}