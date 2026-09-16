// Parameter aplikasi klon full-local — tanpa ketergantungan Base44.

export const appParams = {
  appId: "local",
  token: null,
  fromUrl: typeof window !== "undefined" ? window.location.href : "",
  functionsVersion: "v1",
  appBaseUrl: typeof window !== "undefined" ? window.location.origin : "http://localhost",
};

export const configError = null;
