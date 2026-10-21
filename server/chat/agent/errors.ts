export class AgentError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly answerId?: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'AgentError'
  }
}
