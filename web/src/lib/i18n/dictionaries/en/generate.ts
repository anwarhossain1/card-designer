export const generate = {
  toolbarLabel: "Generate from data",
  title: "Generate cards from a spreadsheet",
  subtitle: (name: string) =>
    `Each row becomes one copy of “${name}” with its own details.`,

  steps: {
    upload: "Upload",
    map: "Map columns",
    review: "Review",
    output: "Download",
  },

  noDocument: {
    title: "No design to generate from",
    body: "Open the editor and design a card first — add data fields where each student's details should go.",
    cta: "Open the editor",
  },
  noFields: {
    title: "This design has no data fields",
    body: "Add fields from the editor's Data panel (or use a template — its name, phone and email slots are already fillable).",
    cta: "Back to the editor",
  },

  upload: {
    prompt: "Drop a spreadsheet here, or browse",
    formats: "Excel (.xlsx, .xls) or CSV — up to 1,000 rows",
    privacy:
      "The file is read right here in your browser. Names and details are never uploaded to our servers.",
    pdfRejected:
      "PDFs can't be read reliably. Export the list as Excel or CSV and try again.",
    unreadable: "That file could not be read as a spreadsheet.",
    empty: "No rows found — the sheet needs a header row plus at least one row of data.",
    tooLarge: "That file is over 10 MB. Trim it down and try again.",
    truncated: (max: number) => `Showing the first ${max} rows; the rest were cut.`,
  },

  map: {
    intro: "Match each field on the card to a column from your sheet.",
    fieldHeader: "Card field",
    columnHeader: "Spreadsheet column",
    unmapped: "Leave empty",
    fromRole: "template slot",
    preview: "Preview with the first row",
    nameColumnLabel: "Name files by",
    next: "Review rows",
  },

  review: {
    selected: (chosen: number, total: number) => `${chosen} of ${total} rows selected`,
    warnings: (count: number) =>
      count === 1 ? "1 row has warnings" : `${count} rows have warnings`,
    emptyCell: "Some mapped columns are empty for this row",
    allToggle: "Select all",
    back: "Back",
    next: "Choose output",
  },

  output: {
    intro: "Every card renders at print quality (300 DPI).",
    zip: "ZIP of images",
    zipHint: "One PNG per card and side — for digital use or your own layout.",
    pdf: "Single PDF",
    pdfHint: "One card per page, front and back together — hand it to a print shop.",
    generate: "Generate cards",
    generating: (done: number, total: number) => `Rendering card ${done} of ${total}…`,
    done: (count: number) =>
      count === 1 ? "1 card generated" : `${count} cards generated`,
    doneBody: "Your download should have started. Generate again for a different format.",
    again: "Generate again",
    cancel: "Cancel",
  },
};
