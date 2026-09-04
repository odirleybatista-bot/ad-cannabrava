"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogoutButton() {
  const [saindo, setSaindo] = useState(false);
  const router = useRouter();

  async function sair() {
    try {
      setSaindo(true);

      const supabase = createClient();

      await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    } finally {
      setSaindo(false);
    }
  }

  return (
    <button
      type="button"
      className="botao-sair"
      onClick={sair}
      disabled={saindo}
    >
      {saindo ? "Saindo..." : "Sair"}

      <style jsx>{`
        .botao-sair {
          min-width: 72px;
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid #dce5f0;
          border-radius: 9px;
          background: #ffffff;
          color: #334155;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .botao-sair:disabled {
          opacity: .6;
          cursor: wait;
        }

        @media (max-width: 700px) {
          .botao-sair {
            min-width: 64px;
            min-height: 39px;
            padding: 0 11px;
            font-size: 9px;
          }
        }
      `}</style>
    </button>
  );
}