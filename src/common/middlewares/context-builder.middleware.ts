import { NextFunction, Response } from 'express';
import { DateTime } from 'luxon';
import requestIP from 'request-ip';
import { UAParser } from 'ua-parser-js';

import { IRequest } from '../interfaces/express-request.interface';
import { handleUndefinedString } from '../utils/handle-undefined-string.util';

export function contextBuilder(req: IRequest, _res: Response, next: NextFunction) {
  const parsedUserAgent = UAParser(req.headers['user-agent']);

  req.context = {
    ipAddress: requestIP.getClientIp(req) || 'unknown',
    userAgent: {
      raw: parsedUserAgent.ua.toString(),
      cpu: handleUndefinedString(parsedUserAgent.cpu.toString()),
      os: handleUndefinedString(parsedUserAgent.os.toString()),
      device: handleUndefinedString(parsedUserAgent.device.toString()),
      engine: handleUndefinedString(parsedUserAgent.engine.toString()),
      browser: handleUndefinedString(parsedUserAgent.browser.toString()),
    },
    timestamp: DateTime.now().toMillis(),
  };

  next();
}
