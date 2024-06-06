
import { Injectable, NestMiddleware } from '@nestjs/common';
import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
	const startTime = Date.now();
	const requestId = crypto.randomUUID();
	console.log(JSON.stringify({ message: `Begin of the request`, requestId }));
	req[requestId] = requestId;
    next();
	const duration = Date.now() - startTime;
	console.log(JSON.stringify({ message: `End of the request`, requestId, duration }));
  }
}
