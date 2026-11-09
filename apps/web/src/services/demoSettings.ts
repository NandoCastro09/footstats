import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface DemoSettings {
  error: "off" | "500" | "503" | "404";
  delay: 0 | 1500 | 3000;
}

const STORAGE_KEY = "footstats:demo";
const defaults: DemoSettings = { error: "off", delay: 0 };

function load(): DemoSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

let settings = load();
const listeners = new Set<() => void>();

export function getDemoSettings() {
  return settings;
}

export function setDemoSettings(next: Partial<DemoSettings>) {
  settings = { ...settings, ...next };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // sem localStorage: a simulação vale só até recarregar a página
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemoSettings() {
  return useSyncExternalStore(subscribe, getDemoSettings);
}

export function useUpdateDemoSettings() {
  const queryClient = useQueryClient();
  return (next: Partial<DemoSettings>) => {
    setDemoSettings(next);
    queryClient.resetQueries();
  };
}

export function demoHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (settings.error !== "off") headers["x-simulate-error"] = settings.error;
  if (settings.delay > 0) headers["x-simulate-delay"] = String(settings.delay);
  return headers;
}
