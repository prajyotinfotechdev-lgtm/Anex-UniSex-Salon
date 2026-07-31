import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

export const loggerMiddleware = pinoHttp({
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers['x-request-id'];
    if (existingID) return existingID;
    const id = uuidv4();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url === '/api/v1/health', // Ignore health checks
  }
});
