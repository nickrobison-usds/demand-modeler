export function formatDate(date: Date): string {
  return `${date.getMonth()+1}-${date.getDate()}`;
}

export function parseDate(date: string): Date {
  const [year, month, day] = date.split("-");
  return new Date(`${month}/${day}/${year}`) ;
}

export function getPreviousDate(date: string): string {
  const d = parseDate(date);
  d.setDate(d.getDate() - 1)
  return formatDate(d);

}
