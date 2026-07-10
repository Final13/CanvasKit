let fabricCache: typeof import("fabric")["fabric"] | null = null;

export async function getFabric() {
  if (typeof window === "undefined") {
    throw new Error("Fabric.js can only be loaded in the browser");
  }
  if (fabricCache) return fabricCache;

  const mod = await import("fabric");
  const f = (mod as any).fabric || (mod as any).default?.fabric || mod;
  fabricCache = f;
  return f;
}
