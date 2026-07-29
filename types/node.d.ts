declare module "node:http" {
  export interface IncomingMessage { method?: string; url?: string; on(event: string, cb: (chunk?: any) => void): void }
  export interface ServerResponse { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }
  export function createServer(handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>): { listen(port: number, host: string, cb: () => void): void };
}
declare module "node:assert/strict" { const assert: any; export default assert }
declare module "node:test" { const test: (name: string, fn: () => void | Promise<void>) => void; export default test }
declare const process: { env: Record<string, string | undefined> };
