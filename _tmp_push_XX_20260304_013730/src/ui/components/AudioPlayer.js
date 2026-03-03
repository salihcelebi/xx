export function renderAudioPlayer(src = '') {
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = src;
  return audio;
}
