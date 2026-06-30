export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiFetchOptions = RequestInit;

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { headers, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const nextHeaders = new Headers(headers);
  const isFormDataBody =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

  if (!nextHeaders.has("Content-Type") && rest.body && !isFormDataBody) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${normalizedPath}`, {
    credentials: "include",
    ...rest,
    headers: nextHeaders,
  });
}
