export type Result<TSuccess, TError = never> =
  | { success: true; value: TSuccess }
  | { success: false; error: TError };

export function ok<TSuccess, TError = never>(
  value: TSuccess
): Result<TSuccess, TError> {
  return { success: true, value };
}

export function fail<TError>(error: TError): Result<never, TError> {
  return { success: false, error };
}
