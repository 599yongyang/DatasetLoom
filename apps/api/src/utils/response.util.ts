import { HttpStatus } from '@nestjs/common';

export class ResponseUtil {
  // 成功响应
  static success<T>(data?: T, message = 'Success', statusCode = HttpStatus.OK) {
    return {
      statusCode,
      message,
      data,
    };
  }

  // 错误响应
  static error(message = 'Internal server error', statusCode = HttpStatus.INTERNAL_SERVER_ERROR, error?: any) {
    return {
      statusCode,
      message,
      error,
    };
  }

  // 业务错误响应
  static badRequest(message = 'Bad request', error?: any) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error,
    };
  }

  // 未授权响应
  static unauthorized(message = 'Unauthorized') {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
    };
  }

  // 禁止访问响应
  static forbidden(message = 'Forbidden') {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message,
    };
  }

  // 未找到响应
  static notFound(message = 'Not found') {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message,
    };
  }
}
