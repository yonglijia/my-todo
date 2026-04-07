import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response<ApiResponse<null>>) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};