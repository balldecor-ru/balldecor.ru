import { beforeEach, describe, expect, it, vi } from 'vitest'
import { replaceIndex } from './indexer'
import { searchRequest, collection } from './client'
vi.mock('./client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./client')>()),
  searchRequest: vi.fn(),
}))
const request = vi.mocked(searchRequest)
const rows = [
  {
    id: 'old:page:1',
    name: 'Шар',
    description: null,
    intro: null,
    content: null,
    price: 123.45,
  },
]
beforeEach(() => request.mockReset())
describe('Замена поискового индекса', () => {
  it('сохраняет прежний индекс при ошибке импорта', async () => {
    request
      .mockResolvedValueOnce({ collection_name: `${collection}_old` })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce('{"success":false}')
      .mockResolvedValueOnce({})
    await expect(replaceIndex(rows)).rejects.toThrow('Ошибка импорта')
    expect(
      request.mock.calls.some(
        ([path, init]) =>
          path === `/aliases/${collection}` && init?.method === 'PUT',
      ),
    ).toBe(false)
    expect(request.mock.calls.at(-1)?.[0]).not.toBe(
      `/collections/${collection}_old`,
    )
    expect(request.mock.calls.at(-1)?.[1]?.method).toBe('DELETE')
  })
  it('публикует заполненный индекс перед удалением прежнего', async () => {
    request
      .mockResolvedValueOnce({ collection_name: `${collection}_old` })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce('{"success":true}')
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
    await replaceIndex(rows)
    expect(request.mock.calls[3][0]).toBe(`/aliases/${collection}`)
    expect(request.mock.calls[3][1]?.method).toBe('PUT')
    expect(request.mock.calls[4]).toEqual([
      `/collections/${collection}_old`,
      { method: 'DELETE' },
    ])
  })
})
