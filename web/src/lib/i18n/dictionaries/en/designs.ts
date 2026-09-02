export const designs = {
  title: "Your designs",
  count: (n: number) => `${n} card${n === 1 ? "" : "s"}`,
  newDesign: "New design",
  newDesignHint: "Start from a blank 3.5 × 2 in card",
  open: (name: string) => `Open ${name}`,
  edited: (when: string) => `Edited ${when}`,
  untitled: "Untitled card",
  loading: "Loading your designs…",
  failed: "Could not load your designs. Check your connection and try again.",
  retry: "Try again",
  empty: {
    title: "No designs yet",
    body: "Cards you make are saved here automatically.",
    action: "Design your first card",
  },
  remove: "Delete",
  removeConfirm: "Delete?",
  removeCancel: "Keep",
  removing: "Deleting…",
  /** Guests keep designs against a browser cookie, which is easy to lose. */
  guestNote:
    "These are saved to this browser. Sign in and they follow you to any device.",
  backToEditor: "Back to the editor",
};
