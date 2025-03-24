import {
  CallbacksRoute,
  RouterStructure,
} from '../../interfaces/RouterStructure';

/**
 * A utility class for defining HTTP routes in a structured way.
 * Provides static methods for each HTTP method (GET, POST, PUT, DELETE, OPTIONS, PATCH).
 */
export class Router {
  /**
   * Defines a GET route.
   *
   * @param path - The URL path for the route.
   * @param callbacks - A list of callback functions to handle the request.
   * @returns A `RouterStructure` object defining the GET route.
   *
   * Example:
   * ```typescript
   * const route = Router.get('/users', getUsersHandler);
   * ```
   */
  public static get(
    path: string,
    ...callbacks: CallbacksRoute
  ): RouterStructure {
    return {
      method: 'GET',
      path,
      callbacks,
    };
  }

  /**
   * Defines a POST route.
   *
   * @param path - The URL path for the route.
   * @param callbacks - A list of callback functions to handle the request.
   * @returns A `RouterStructure` object defining the POST route.
   *
   * Example:
   * ```typescript
   * const route = Router.post('/users', createUserHandler);
   * ```
   */
  public static post(
    path: string,
    ...callbacks: CallbacksRoute
  ): RouterStructure {
    return {
      method: 'POST',
      path,
      callbacks,
    };
  }

  /**
   * Defines a PUT route.
   *
   * @param path - The URL path for the route.
   * @param callbacks - A list of callback functions to handle the request.
   * @returns A `RouterStructure` object defining the PUT route.
   *
   * Example:
   * ```typescript
   * const route = Router.put('/users/:id', updateUserHandler);
   * ```
   */
  public static put(
    path: string,
    ...callbacks: CallbacksRoute
  ): RouterStructure {
    return {
      method: 'PUT',
      path,
      callbacks,
    };
  }

  /**
   * Defines a DELETE route.
   *
   * @param path - The URL path for the route.
   * @param callbacks - A list of callback functions to handle the request.
   * @returns A `RouterStructure` object defining the DELETE route.
   *
   * Example:
   * ```typescript
   * const route = Router.delete('/users/:id', deleteUserHandler);
   * ```
   */
  public static delete(
    path: string,
    ...callbacks: CallbacksRoute
  ): RouterStructure {
    return {
      method: 'DELETE',
      path,
      callbacks,
    };
  }

  /**
   * Defines an OPTIONS route.
   *
   * @param path - The URL path for the route.
   * @param callbacks - A list of callback functions to handle the request.
   * @returns A `RouterStructure` object defining the OPTIONS route.
   *
   * Example:
   * ```typescript
   * const route = Router.options('/users', optionsHandler);
   * ```
   */
  public static options(
    path: string,
    ...callbacks: CallbacksRoute
  ): RouterStructure {
    return {
      method: 'OPTIONS',
      path,
      callbacks,
    };
  }

  /**
   * Defines a PATCH route.
   *
   * @param path - The URL path for the route.
   * @param callbacks - A list of callback functions to handle the request.
   * @returns A `RouterStructure` object defining the PATCH route.
   *
   * Example:
   * ```typescript
   * const route = Router.patch('/users/:id', patchUserHandler);
   * ```
   */
  public static patch(
    path: string,
    ...callbacks: CallbacksRoute
  ): RouterStructure {
    return {
      method: 'PATCH',
      path,
      callbacks,
    };
  }
}
