export function msToTimeString(duration: number) {
  const d = Math.floor(duration);
  const milliseconds = d % 1000;
  const seconds = Math.floor(d / 1000) % 60;
  const minutes = Math.floor(d / (1000 * 60)) % 60;
  const hours = Math.floor(d / (1000 * 3600)) % 24;

  const shours = hours < 10 ? "0" + hours : hours;
  const sminutes = minutes < 10 ? "0" + minutes : minutes;
  const sseconds = seconds < 10 ? "0" + seconds : seconds;
  const sms = `${milliseconds}`.padEnd(3, "0");

  return `${shours}:${sminutes}:${sseconds}.${sms}`;
}

export function timestampToMilliseconds(ts: string) {
  return Number(ts) * 1000;
}
