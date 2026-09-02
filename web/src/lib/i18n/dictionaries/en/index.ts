import { landing } from "./landing";
import { editor } from "./editor";
import { auth } from "./auth";
import { designs } from "./designs";
import { generate } from "./generate";

export const en = {
  common: {
    language: "Language",
    switchLanguage: "ভাষা পরিবর্তন করুন",
  },
  landing,
  editor,
  auth,
  designs,
  generate,
};

/**
 * English is the reference shape: every other locale must satisfy it, so a
 * missing or misspelled key is a compile error rather than a blank label.
 */
export type Dictionary = typeof en;
