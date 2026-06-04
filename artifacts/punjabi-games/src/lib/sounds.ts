const SOUND_PATH = "/sounds";

const cache: Record<string, HTMLAudioElement> = {};

function getAudio(src: string): HTMLAudioElement {
  if (!cache[src]) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.load();
    cache[src] = audio;
  }
  return cache[src];
}

function play(name: string) {
  const audio = getAudio(`${SOUND_PATH}/${name}.mp3`);
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn(`[sound] ${name} failed:`, err);
    });
  }
}

export function playSpin() { play("spin"); }
export function playCorrect() { play("correct"); }
export function playWrong() { play("wrong"); }
