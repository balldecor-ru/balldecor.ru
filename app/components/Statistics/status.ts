import { isRouteErrorResponse, type UIMatch } from 'react-router'

export type PageStatus = 'success' | 'failed'

export interface PageOutcome {
  statusCode: number
  status: PageStatus
}

export const isHttpStatusCode = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 100 &&
  value <= 599

export const pageOutcome = (statusCode: number): PageOutcome => ({
  statusCode,
  status: statusCode >= 400 ? 'failed' : 'success',
})

// Successful routes default to 200. A loader returning a different HTTP status
// also exposes statusCode in its data so SPA navigation has the same information.
export const matchedPageStatusCode = (
  matches: readonly Pick<UIMatch, 'loaderData'>[],
): number => {
  for (let index: number = matches.length - 1; index >= 0; index -= 1) {
    const data: unknown = matches[index].loaderData
    if (
      data !== null &&
      typeof data === 'object' &&
      'statusCode' in data &&
      isHttpStatusCode(data.statusCode)
    ) {
      return data.statusCode
    }
  }
  return 200
}

export const errorPageStatusCode = (error: unknown): number =>
  isRouteErrorResponse(error) ? error.status : 500
