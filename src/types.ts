import type { RequestHandler } from './server/handlers/RequestHandler';
import type { ResponseHandler } from './server/handlers/ResponseHandler';

export { SSL } from './interfaces/DomainStructure';

export type {
  CallbackRoute as Route,
  RouterStructure,
} from './interfaces/RouterStructure';
export type { CookieOptions } from './interfaces/Cookies';

// eslint-disable-next-line import/no-cycle
export type { DomainHandler as Server } from './server/handlers/DomainHandler';

export type Request = RequestHandler;
export type Response = ResponseHandler;

export type Next = () => void;
