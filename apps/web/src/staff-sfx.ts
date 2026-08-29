"use client";

import { createUISFX, type CueName, type UISFXPlayer } from "uisfx";

const preferenceKey = "stack-and-scale.staff.sound-enabled";
let player: UISFXPlayer | null = null;

function savedSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(preferenceKey) !== "false";
}

function getPlayer(): UISFXPlayer {
  if (player === null) {
    player = createUISFX({
      pack: "minimal",
      volume: 0.7,
      enabled: savedSoundPreference(),
    });
  }
  return player;
}

export function playStaffCue(cue: CueName): void {
  if (typeof window === "undefined") return;
  if (player === null) return;
  player.play(cue, { retrigger: "ignore" });
}

export function primeStaffAudio(cue: CueName): void {
  if (typeof window === "undefined") return;
  const ui = getPlayer();
  ui.play(cue, { retrigger: "ignore" });
  void ui.unlock();
}

export function soundEnabled(): boolean {
  return getPlayer().isEnabled();
}

export function setSoundEnabled(enabled: boolean): void {
  const ui = getPlayer();
  if (!enabled) ui.stopAll();
  ui.setEnabled(enabled);
  window.localStorage.setItem(preferenceKey, String(enabled));
}
