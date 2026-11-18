export type ConsentState = { consent_save: boolean; consent_share: boolean };

export function nextConsent(state: ConsentState, type: "save" | "share", granted: boolean): ConsentState {
  if (type === "save") return { consent_save: granted, consent_share: granted && state.consent_share };
  return { ...state, consent_share: state.consent_save && granted };
}

export function canContinueAge(checked: boolean) { return checked === true; }