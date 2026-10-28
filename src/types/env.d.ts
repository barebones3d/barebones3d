declare namespace NodeJS {
  interface Process {
    cwd(): string;
    exit(code?: number): never;
    argv: string[];
    env: Record<string, string | undefined>;
  }
}

declare const process: NodeJS.Process;

declare module 'node:fs' {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: string): string;
  export function writeFileSync(path: string, data: string, encoding: string): void;
  export function appendFileSync(path: string, data: string, encoding: string): void;
  export function readdirSync(path: string): string[];
  const fs: {
    existsSync: typeof existsSync;
    mkdirSync: typeof mkdirSync;
    readFileSync: typeof readFileSync;
    writeFileSync: typeof writeFileSync;
    appendFileSync: typeof appendFileSync;
    readdirSync: typeof readdirSync;
  };
  export default fs;
}

declare module 'node:path' {
  export function join(...paths: string[]): string;
  export function basename(p: string): string;
  export function resolve(...paths: string[]): string;
  const path: {
    join: typeof join;
    basename: typeof basename;
    resolve: typeof resolve;
  };
  export default path;
}

declare module 'node:assert' {
  export function ok(value: unknown, message?: string): asserts value;
  export function strictEqual<T>(actual: unknown, expected: T, message?: string): void;
  const assert: {
    ok: typeof ok;
    strictEqual: typeof strictEqual;
  };
  export default assert;
}

declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string);
    exec(sql: string): void;
    prepare(sql: string): {
      all(...params: any[]): any[];
      run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    };
  }
}

declare module 'node:child_process' {
  export function execSync(command: string, options?: any): string | Buffer;
}

