import { requireCurrentAthlete } from "@/lib/auth/current-athlete";
import TermoClient from "./TermoClient";

export default async function TermoPage() {
  const { atletaId } =
    await requireCurrentAthlete();

  return (
    <TermoClient
      atletaId={atletaId}
    />
  );
}