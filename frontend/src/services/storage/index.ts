import { env } from "#/integrations/env";
import { HttpError } from "#/integrations/http";
import type { TResponse } from "#/utils/response";

export type TStorageUploadResponse = {
  url: string;
  mimeType: string;
};

function getError(err: unknown): Error {
  if (err instanceof HttpError) return err;
  if (err instanceof Error) return err;
  return new Error("An unexpected error occurred.");
}

const upload = () => ({
  mutationFn: async (file: File): Promise<TStorageUploadResponse> => {
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${env.VITE_API_URL}/storage/upload`, {
        method: "POST",
        body: form,
      });

      const json = (await res.json()) as TResponse<TStorageUploadResponse>;
      if (!res.ok) throw new HttpError(res.status, json);

      return json.content as TStorageUploadResponse;
    } catch (err) {
      throw getError(err);
    }
  },
});

export { upload };
