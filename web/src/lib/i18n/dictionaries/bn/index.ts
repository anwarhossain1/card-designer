import type { Dictionary } from "../en";
import { landing } from "./landing";
import { editor } from "./editor";
import { auth } from "./auth";

export const bn: Dictionary = {
  common: {
    language: "ভাষা",
    switchLanguage: "Switch to English",
  },
  landing,
  editor,
  auth,
};
