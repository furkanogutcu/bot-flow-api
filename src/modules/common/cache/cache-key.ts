export class CacheKey {
  private static readonly separator = ':';
  private static readonly scopes = {
    users: 'users',
  };

  static of<T extends keyof typeof CacheKey.keys>(
    methodName: T,
    ...args: Parameters<(typeof CacheKey.keys)[T]>
  ): string {
    return (CacheKey.keys[methodName] as (...args: any[]) => any)(...args);
  }

  private static generateKey(keys: string[]): string {
    return keys.join(this.separator);
  }

  private static keys = {};
}
