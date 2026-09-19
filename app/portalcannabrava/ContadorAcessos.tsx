"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

type Estatisticas = {
  total: number;
  hoje: number;
};

function gerarSessionId() {
  if (
    typeof window ===
    "undefined"
  ) {
    return "";
  }

  const chave =
    "cannabrava_portal_session";

  let id =
    sessionStorage.getItem(
      chave
    );

  if (!id) {
    id =
      typeof crypto !==
        "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;

    sessionStorage.setItem(
      chave,
      id
    );
  }

  return id;
}

export default function ContadorAcessos() {
  const [
    estatisticas,
    setEstatisticas,
  ] = useState<Estatisticas | null>(
    null
  );

  useEffect(() => {
    let ativo = true;

    async function registrar() {
      try {
        const supabase =
          createClient();

        const sessionId =
          gerarSessionId();

        if (!sessionId) {
          return;
        }

        const {
          data,
          error,
        } =
          await supabase.rpc(
            "registrar_acesso_portal",
            {
              p_session_id:
                sessionId,
            }
          );

        if (error) {
          console.error(
            "Erro no contador do Portal Cannabrava:",
            error
          );

          return;
        }

        const registro =
          Array.isArray(data)
            ? data[0]
            : data;

        if (
          ativo &&
          registro
        ) {
          setEstatisticas({
            total:
              Number(
                registro.total_acessos ||
                  0
              ),

            hoje:
              Number(
                registro.visitantes_hoje ||
                  0
              ),
          });
        }
      } catch (erro) {
        console.error(
          "Erro ao registrar acesso:",
          erro
        );
      }
    }

    registrar();

    return () => {
      ativo = false;
    };
  }, []);

  if (!estatisticas) {
    return (
      <div className="contador-acessos carregando">
        Contabilizando acessos...
      </div>
    );
  }

  return (
    <div className="contador-acessos">
      <div>
        <span>
          VISITAS AO PORTAL
        </span>

        <strong>
          {estatisticas.total.toLocaleString(
            "pt-BR"
          )}
        </strong>
      </div>

      <i />

      <div>
        <span>
          VISITANTES HOJE
        </span>

        <strong>
          {estatisticas.hoje.toLocaleString(
            "pt-BR"
          )}
        </strong>
      </div>
    </div>
  );
}