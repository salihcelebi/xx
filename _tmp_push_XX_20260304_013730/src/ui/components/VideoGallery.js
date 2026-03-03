export function renderVideoGallery(items = []) {
  const root = document.createElement('section');
  root.className = 'video-gallery';
  items.forEach((item) => {
    const video = document.createElement('video');
    video.controls = true;
    video.src = item.videoUrl || '';
    root.append(video);
  });
  return root;
}
