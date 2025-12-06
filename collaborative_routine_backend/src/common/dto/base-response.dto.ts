export class BaseResponseDto<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
