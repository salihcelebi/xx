export function timeAgoTR(ts) {
  const diffMin = Math.floor((Date.now() - Number(ts || Date.now())) / 60000);
  if (diffMin < 1) return 'Şimdi';
  if (diffMin < 60) return `${diffMin} dk`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} sa`;
  return 'Dün';
}
