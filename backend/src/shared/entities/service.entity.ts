export interface ServiceResponse<T> {
  data?: T;
  err?: { message: string; code: number };
  status: boolean;
}

export function HandleServiceResponseSuccess<T>(data: T): ServiceResponse<T> {
  return { status: true, data }
}

export function HandleServiceResponseCustomError(message: string, code: number): ServiceResponse<{}> {
  return { status: false, data: {}, err: { message, code } }
}

export function BadRequestWithMessage(message: string): ServiceResponse<{}> {
  return { status: false, data: {}, err: { message, code: 400 } }
}

export const INTERNAL_SERVER_ERROR_SERVICE_RESPONSE: ServiceResponse<{}> = {
  status: false,
  data: {},
  err: { message: "Internal Server Error", code: 500 },
}

export const INVALID_ID_SERVICE_RESPONSE: ServiceResponse<{}> = {
  status: false,
  data: {},
  err: { message: "Invalid ID, Data not Found", code: 404 },
}

export const ResponseStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const
