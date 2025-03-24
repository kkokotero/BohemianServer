/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { InputType, ZlibOptions } from 'zlib';

declare global {
  var gzipAsync: (
    buffer: InputType,
    options?: ZlibOptions | undefined,
  ) => Promise<Buffer<ArrayBufferLike>>;
  var deflateAsync: (
    buffer: InputType,
    options?: ZlibOptions | undefined,
  ) => Promise<Buffer<ArrayBufferLike>>;
}
