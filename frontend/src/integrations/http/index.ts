import { env } from "#/integrations/env";
import type { TResponse } from "#/utils/response";

type RequestOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, string>;
  body?: unknown;
};

type GetAllOptions = Omit<RequestOptions, "body">;

class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: TResponse<unknown>,
  ) {
    super(data.message ?? `HTTP ${status}`);
    this.name = "HttpError";
  }
}

async function request<T>(
  path: string,
  { params, body, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const base = new URL(path, env.VITE_API_URL);

  let rawUrl = base.toString();
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v != null) qs.set(k, v);
    }
    const qsStr = qs.toString();
    if (qsStr) rawUrl += (base.search ? "&" : "?") + qsStr;
  }

  const res = await fetch(rawUrl, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) throw new HttpError(res.status, json);

  return json;
}

export const http = {
  getAll<T>(path: string, options: GetAllOptions = {}) {
    return request<T>(path, { ...options, method: "GET" });
  },

  get<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "POST", body });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};

export { HttpError };
export type { RequestOptions };
