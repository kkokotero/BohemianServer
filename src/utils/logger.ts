/**
 * Logger System
 *
 * A lightweight and customizable logging system for Node.js applications.
 * Supports different log levels (info, success, warning, error) with colored output.
 * Allows customization of log structure and formatting.
 *
 * @example
 * const logger = new Logger();
 * logger.info('This is an info message');
 * logger.success('This is a success message');
 * logger.warning('This is a warning message');
 * logger.error('This is an error message');
 *
 * @example
 * const customLogger = new Logger({
 *   format: (level, message) => `[${level.toUpperCase()}] ${new Date().toISOString()} - ${message}`,
 * });
 * customLogger.info('Custom formatted log');
 */
export class Logger {
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
  };

  private levels = {
    info: { color: this.colors.cyan, label: 'INFO' },
    success: { color: this.colors.green, label: 'SUCCESS' },
    warning: { color: this.colors.yellow, label: 'WARNING' },
    error: { color: this.colors.red, label: 'ERROR' },
  };

  private format: (level: string, message: string) => string;

  /**
   * Creates a new Logger instance.
   * @param options - Optional configuration for the logger.
   * @param options.format - A function to customize the log format.
   *
   * @example
   * const logger = new Logger({
   *   format: (level, message) => `[${level}] ${new Date().toISOString()} - ${message}`,
   * });
   */
  constructor(
    options: { format?: (level: string, message: string) => string } = {},
  ) {
    this.format =
      options.format || ((level, message) => `${level}: ${message}`);
  }

  /**
   * Logs an info message.
   * @param message - The message to log.
   *
   * @example
   * logger.info('This is an info message');
   */
  info(message: string): void {
    this.log('info', message);
  }

  /**
   * Logs a success message.
   * @param message - The message to log.
   *
   * @example
   * logger.success('This is a success message');
   */
  success(message: string): void {
    this.log('success', message);
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   *
   * @example
   * logger.warning('This is a warning message');
   */
  warning(message: string): void {
    this.log('warning', message);
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   *
   * @example
   * logger.error('This is an error message');
   */
  error(message: string): void {
    this.log('error', message);
  }

  /**
   * Internal method to log messages with the specified level.
   * @param level - The log level (info, success, warning, error).
   * @param message - The message to log.
   */
  private log(level: keyof typeof this.levels, message: string): void {
    const { color, label } = this.levels[level];
    const formattedMessage = this.format(label, message);
    console.log(`${color}${formattedMessage}${this.colors.reset}`);
  }
}
