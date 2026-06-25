export const loadOptionalPackage = <T>(packageName: string): T => {
  try {
    return require(packageName) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Missing runtime dependency "${packageName}": ${reason}`);
  }
};
