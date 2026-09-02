const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/**
 * "2 hours ago" in whichever language is showing.
 *
 * Intl does the wording, so Bangla gets Bangla numerals and grammar without a
 * second set of strings to keep in step with the first.
 */
export function formatRelativeTime(iso: string, locale: string): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  let duration = (Date.parse(iso) - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), "year");
}
