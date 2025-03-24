/* eslint-disable max-classes-per-file */
import type { RouterStructure } from '../../interfaces/RouterStructure';

/**
 * Represents a node in a routing tree structure.
 * Each node can have multiple child nodes, forming a hierarchical routing system.
 */
export class RouteNode {
  /**
   * A map of child route nodes, where the key is the route segment and the value is the corresponding `RouteNode`.
   *
   * Example:
   * ```typescript
   * const node = new RouteNode();
   * node.children.set('users', new RouteNode());
   * ```
   */
  children: Map<string, RouteNode> = new Map();

  /**
   * The route handler associated with this node.
   * This represents the logic that will be executed when the route is matched.
   *
   * Example:
   * ```typescript
   * node.handler = { path: '/users', method: 'GET', callbacks: [handlerFunction] };
   * ```
   */
  handler?: RouterStructure;

  /**
   * Stores the name of the parameter if this node represents a dynamic segment (e.g., `:id`).
   *
   * Example:
   * ```typescript
   * node.paramName = 'id'; // Matches `/users/:id`
   * ```
   */
  paramName?: string;
}

/**
 * Represents a domain-based hierarchical routing system.
 * This structure allows managing routes under different domains.
 */
export class DomainThree {
  /**
   * A map of child domain trees, where the key is the domain segment and the value is the corresponding `DomainThree`.
   *
   * Example:
   * ```typescript
   * const domain = new DomainThree();
   * domain.children.set('example.com', new DomainThree());
   * ```
   */
  children: Map<string, DomainThree> = new Map();

  /**
   * The root of the routing tree for this domain.
   * It stores the main routes associated with the domain.
   *
   * Example:
   * ```typescript
   * domain.routes.handler = { path: '/', method: 'GET', callbacks: [homepageHandler] };
   * ```
   */
  routes: RouteNode = new RouteNode();
}
