// plain-text.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PlainTextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.is('text/plain')) {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        req.body = data;
        next();
      });
    } else {
      next();
    }
  }
}
