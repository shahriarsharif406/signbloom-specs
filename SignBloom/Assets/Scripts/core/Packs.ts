import { ASL_SIGNS, BANGLA_STARTER_SIGNS, Sign } from "./SignLibrary";

/**
 * A sign pack = one sign language's set of static handshapes.
 * The engine is language-agnostic: adding a pack is adding an entry here.
 */
export type SignPack = {
  id: string;
  name: string;
  /** Sign language this pack belongs to. */
  language: string;
  /** "starter" = hand-picked and not yet reviewed by a signer or educator. */
  status: "starter" | "reviewed";
  signs: readonly Sign[];
};

export const PACKS: readonly SignPack[] = [
  { id: "asl", name: "American Sign Language — numbers & handshapes", language: "ASL", status: "starter", signs: ASL_SIGNS },
  { id: "bangla", name: "Bangla numerals (starter)", language: "BdSL", status: "starter", signs: BANGLA_STARTER_SIGNS },
];

export const DEFAULT_PACK_ID = "asl";

export function getPack(id: string): SignPack {
  return PACKS.find((p) => p.id === id) ?? (PACKS.find((p) => p.id === DEFAULT_PACK_ID) as SignPack);
}
