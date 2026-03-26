import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let sessionId = req.signedCookies ? req.signedCookies['cybership_session'] : undefined;
    if (!sessionId) {
      sessionId = randomUUID();
      res.cookie('cybership_session', sessionId, {
        httpOnly: true,
        signed: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
    }
    (req as any).sessionId = sessionId;
    next();
  }
}
