import { redirect } from "next/navigation";
import { getCurrentUser } from "./current-user";

export async function requireCurrentAthlete() {
  const usuario =
    await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  if (!usuario.atletaId) {
    redirect(
      "/portal-atleta/dados"
    );
  }

  return {
    usuario,
    atletaId:
      usuario.atletaId,
  };
}