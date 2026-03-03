export function renderImageGrid(images = []) {
  const grid = document.createElement('section');
  grid.className = 'image-grid';
  images.forEach((item) => {
    const img = document.createElement('img');
    img.src = item.imgUrl || '';
    img.alt = 'Üretilen görsel';
    grid.append(img);
  });
  return grid;
}
