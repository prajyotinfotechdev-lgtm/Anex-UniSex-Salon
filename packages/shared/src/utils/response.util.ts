export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  errors?: any[];
  traceId?: string;
}

export const successResponse = <T>(
  message: string,
  data?: T,
  meta?: any
): ApiResponse<T> => {
  return {
    success: true,
    message,
    ...(data && { data }),
    ...(meta && { meta }),
  };
};

export const errorResponse = (
  message: string,
  errors?: any[],
  traceId?: string
): ApiResponse => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
    ...(traceId && { traceId }),
  };
};
