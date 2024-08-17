import selectSFX from "../audio/select.mp3";
import enterSFX from "../audio/enter.mp3";
import backSFX from "../audio/back.mp3";

export function playSound(soundName: string) {
  let audio;
  switch (soundName) {
    case "select":
      audio = new Audio(selectSFX);
      break;
    case "enter":
      audio = new Audio(enterSFX);
      break;
    case "back":
      audio = new Audio(backSFX);
      break;
    default:
      break;
  }
  audio?.play();
}

export function playSoundDelay(
  soundName: string,
  action = () => {},
  delay = 200
) {
  playSound(soundName);
  setTimeout(() => {
    action();
  }, delay);
}
