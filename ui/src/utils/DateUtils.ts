export function formatDate(date: Date): string {
  return `${date.getMonth() + 1}-${date.getDate()}`;
}

export function parseDate(date: string): Date {
  const parts = date.split("-");
  if (parts.length === 2) {
    parts.unshift(`${new Date().getFullYear()}`);
  }
  const [year, month, day] = parts;
  return new Date(`${month}/${day}/${year}`);
}

export function isSameDate(a: Date, b: Date) {
  return a.getDate() === b.getDate();
}

export function getPreviousDate(date: Date): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() - 1);
  return d;
}

const theMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const addZero = (i: number) => {
  if (i < 10) {
    return `0${i}`;
  }
  return i;
};

export const dateTimeString = (date: Date) => {
  const hour = addZero(date.getHours());
  const minute = addZero(date.getMinutes());
  const month = theMonths[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${hour}:${minute} ${month} ${day}, ${year}`;
};

export const monthDay = (date: Date) => {
  const hour = addZero(date.getHours());
  const minute = addZero(date.getMinutes());
  const m = date.getMonth()
  const month = theMonths[m];
  const day = date.getDate();
  const year = date.getFullYear();
  // Changing this may break all the bar graphs
  return `${year}${m}${day}${hour}:${minute}|${month}-${day}`;
};
