export const INTRO_COMPLETED_KEY = "daybreak-intro-v1";
export const INTRO_FADE_IN_MS = 600;
export const INTRO_FADE_OUT_MS = 400;

export function shouldPlayIntro(alreadyAdult: boolean, completed: string | null) {
  return !alreadyAdult && completed !== "true";
}