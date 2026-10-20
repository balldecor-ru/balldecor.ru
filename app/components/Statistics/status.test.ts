import { expect, test } from 'vitest'
import {
  errorPageStatusCode,
  matchedPageStatusCode,
  pageOutcome,
} from './status'

test.each([200, 301, 399, 400, 401, 403, 404, 410, 500, 503])(
  'classifies page status %i',
  (statusCode: number) => {
    expect(pageOutcome(statusCode)).toEqual({
      statusCode,
      status: statusCode >= 400 ? 'failed' : 'success',
    })
  },
)

test('uses the committed leaf loader status and resets to success on a normal page', () => {
  expect(
    matchedPageStatusCode([
      { loaderData: null },
      { loaderData: { statusCode: 404 } },
    ]),
  ).toBe(404)
  expect(
    matchedPageStatusCode([
      { loaderData: { statusCode: 200 } },
      { loaderData: { statusCode: 503 } },
    ]),
  ).toBe(503)
  expect(
    matchedPageStatusCode([{ loaderData: null }, { loaderData: undefined }]),
  ).toBe(200)
})

test.each([401, 403, 404, 500, 503])(
  'preserves HTTP %i from a route error response',
  (status: number) => {
    expect(
      errorPageStatusCode({
        status,
        statusText: 'Fixture error',
        internal: false,
        data: null,
      }),
    ).toBe(status)
  },
)

test.each([
  new Error('Rendering failed'),
  new TypeError('Chunk failed'),
  undefined,
  'Failed',
])('classifies a non-HTTP error boundary as 500', (error: unknown) =>
  expect(errorPageStatusCode(error)).toBe(500),
)
