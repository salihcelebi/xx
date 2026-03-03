export function renderMessageToolbar() {
  const bar = document.createElement('div');
  bar.className = 'message-toolbar';
  ['Kopyala', 'Beğen', 'Beğenmedim', 'Şikayet Et', 'Yeniden Üret'].forEach((text) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    bar.append(btn);
  });
  return bar;
}
