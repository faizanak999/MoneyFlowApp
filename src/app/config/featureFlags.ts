function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

export const isAiEnabled = parseBooleanEnv(
  import.meta.env.VITE_ENABLE_AI as string | undefined,
  true,
);
