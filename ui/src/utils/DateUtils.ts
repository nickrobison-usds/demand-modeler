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

const theMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const addZero = (i: number) => {
  if (i < 10) {
    return `0${i}`;
  }
  return i;
}

export const dateTimeString = (date: Date) => {
  const hour = addZero(date.getHours());
  const minute = addZero(date.getMinutes());
  const month = theMonths[date.getMonth()];
  const day = date.getDay();
  const year = date.getFullYear()
  return `${hour}:${minute} ${month} ${day}, ${year}`;
}
