export type Handler<CE = unknown, CC = unknown, CR = unknown> = (event: CE, context: CC) => Promise<CR>
export type ErrorHandler<CR = unknown> = (err: Error) => Promise<CR>
export type Middleware<CE = unknown, CC = unknown, CR = unknown> = (event: CE, context: CC, response?: CR) => Promise<CR | void>
