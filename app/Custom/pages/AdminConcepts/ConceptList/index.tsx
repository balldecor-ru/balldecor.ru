import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type React from 'react'
import { useSearchParams } from 'react-router'
import { Button } from 'app/Custom/components/Button'
import { useSnackbar } from 'app/Custom/hooks/useSnackbar'
import { Pagination } from 'app/Custom/components/Pagination'
import { CustomKbConceptType } from 'app/Custom/interfaces/conceptType'
import {
  SortOrder,
  KbConceptVisibility,
  useUpdateConceptMutation,
  type UpdateConceptMutationVariables,
  useConceptsConnectionQuery,
  type ConceptsConnectionQueryVariables,
} from 'app/gql/generated'
import { ConceptRow } from './ConceptRow'
import { ConceptRowStyled } from './ConceptRow/styles'
import { ConceptGridStyled, ConceptListStyled } from './styles'

const conceptTypes = Object.values(CustomKbConceptType).sort((a, b) =>
  a.description.localeCompare(b.description, 'ru'),
)

const pageSizes: readonly number[] = [0, 20, 50, 100, 500, 1000]
const qualityLevels: readonly number[] = [0, 0.5, 0.8, 1]
const sortFields = ['createdAt', 'updatedAt', 'name', 'uri'] as const

export const ConceptList: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const requestedSize = Number(params.get('take') ?? '20')
  const take = pageSizes.includes(requestedSize) ? requestedSize : 20
  const requestedPage = Number(params.get('page') ?? '1')
  const page =
    take !== 0 &&
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0 &&
    (requestedPage - 1) * take <= 2147483647
      ? requestedPage
      : 1
  const sort =
    sortFields.find((field) => field === params.get('sort')) ?? 'createdAt'
  const direction =
    params.get('direction') === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC
  const type = conceptTypes.find(
    (entry) => entry.value === params.get('type'),
  )?.value

  const variables: ConceptsConnectionQueryVariables = useMemo(() => {
    return {
      ...(type ? { where: { type: { equals: type } } } : {}),
      orderBy: { [sort]: direction },
      detailedInfo: false,
      includeCreatedBy: false,
      ...(take === 0 ? {} : { take, skip: (page - 1) * take }),
    }
  }, [direction, page, sort, take, type])

  const { data, loading, error } = useConceptsConnectionQuery({
    variables,
    fetchPolicy: 'network-only',
  })

  const [update, updateResult] = useUpdateConceptMutation()

  const [updateVariables, setUpdateVariables] =
    useState<UpdateConceptMutationVariables>()

  const { addMessage } = useSnackbar() ?? {}

  const save = useCallback(
    async (id: string, data: UpdateConceptMutationVariables['data']) => {
      if (updateResult.loading) {
        return
      }

      try {
        const variables: UpdateConceptMutationVariables = {
          where: { id },
          data,
        }
        setUpdateVariables(variables)
        const result = await update({ variables })
        if (!result.data?.updateConcept) {
          throw new Error('Не удалось сохранить концепт')
        }
        return result.data.updateConcept
      } catch (error) {
        addMessage?.(
          error instanceof Error
            ? error.message
            : 'Не удалось сохранить концепт',
          { variant: 'error' },
        )
      } finally {
        setUpdateVariables(undefined)
      }
    },
    [addMessage, update, updateResult.loading],
  )
  const onChange = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      const { name, dataset } = event.currentTarget
      const concept = data?.concepts.find(
        (concept) => concept.id === dataset.id,
      )
      if (!concept) {
        return
      }
      const published =
        concept.visibility === KbConceptVisibility.PUBLIC ||
        concept.visibility === KbConceptVisibility.HIDDEN
      switch (name) {
        case 'published':
          void save(concept.id, {
            visibility: published
              ? KbConceptVisibility.UNPUBLISHED
              : KbConceptVisibility.PUBLIC,
          })
          break
        case 'hidden':
          if (published) {
            void save(concept.id, {
              visibility:
                concept.visibility === KbConceptVisibility.HIDDEN
                  ? KbConceptVisibility.PUBLIC
                  : KbConceptVisibility.HIDDEN,
            })
          }
          break
        case 'qualityDown':
        case 'qualityUp': {
          const input = document.querySelector<HTMLInputElement>(
            `input[name="quality"][data-id="${CSS.escape(concept.id)}"]`,
          )
          if (!input || input.disabled) {
            return
          }
          const quality = input.valueAsNumber
          const next =
            name === 'qualityDown'
              ? [...qualityLevels].reverse().find((level) => level < quality)
              : qualityLevels.find((level) => level > quality)
          if (next !== undefined) {
            const setter = Object.getOwnPropertyDescriptor(
              HTMLInputElement.prototype,
              'value',
            )?.set
            setter?.call(input, String(next))
            input.dispatchEvent(new Event('input', { bubbles: true }))
          }
          break
        }
        case 'available':
          void save(concept.id, { available: !concept.available })
          break
      }
    },
    [data, save],
  )

  const conceptsRef = useRef(data?.concepts)
  conceptsRef.current = data?.concepts

  const onBlur = useCallback<
    React.EventHandler<React.SyntheticEvent<HTMLInputElement>>
  >(
    (event) => {
      const input = event.currentTarget
      const { name, dataset, value } = input
      const concept = conceptsRef.current?.find(
        (concept) => concept.id === dataset.id,
      )
      if (!concept) {
        return
      }
      if (name === 'quality') {
        if (event.type === 'pointerdown') {
          input.setPointerCapture(
            (event as React.PointerEvent<HTMLInputElement>).pointerId,
          )
          return
        }
        if (event.type === 'pointercancel') {
          input.value = String(concept.quality ?? 0.5)
          return
        }
        if (event.type === 'change' && event.nativeEvent.isTrusted) {
          return
        }
        const quality = input.valueAsNumber
        if (quality === (concept.quality ?? 0.5)) {
          return
        }
        void save(concept.id, { quality }).then((updated) => {
          if (input.isConnected) {
            input.value = String(updated?.quality ?? concept.quality ?? 0.5)
          }
        })
        return
      }
      if (name !== 'price') {
        return
      }
      const normalized = value.trim().replace(',', '.')
      const price = normalized === '' ? null : Number(normalized)
      if (price !== null && (!Number.isFinite(price) || price < 0)) {
        addMessage?.('Введите неотрицательное конечное число', {
          variant: 'error',
        })
        return
      }
      if (price === (concept.price ?? null)) {
        input.value = price === null ? '' : String(price)
        return
      }
      void save(concept.id, { price }).then((updated) => {
        if (updated && input.isConnected) {
          input.value =
            updated.price === null || updated.price === undefined
              ? ''
              : String(updated.price)
        }
      })
    },
    [addMessage, save],
  )
  const total = data?.kBConceptsCount ?? 0
  const pages = take === 0 ? 1 : Math.max(1, Math.ceil(total / take))
  const changeParameter = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      const { name, value } = event.currentTarget
      setParams((previous) => {
        const next = new URLSearchParams(previous)
        if (value) {
          next.set(name, value)
        } else {
          next.delete(name)
        }
        next.delete('page')
        return next
      })
    },
    [setParams],
  )
  const resetFilters = useCallback((): void => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const parameter of ['type', 'sort', 'direction', 'take', 'page']) {
        next.delete(parameter)
      }
      return next
    })
  }, [setParams])
  const firstPage = useCallback((): void => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.delete('page')
      return next
    })
  }, [setParams])
  return (
    <ConceptListStyled>
      <div className="toolbar">
        <label>
          Тип
          <select name="type" value={type ?? ''} onChange={changeParameter}>
            <option value="">Все типы</option>
            {conceptTypes.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.description}
              </option>
            ))}
          </select>
        </label>
        <label>
          Сортировка
          <select name="sort" value={sort} onChange={changeParameter}>
            <option value="createdAt">Дата создания</option>
            <option value="updatedAt">Дата обновления</option>
            <option value="name">Имя</option>
            <option value="uri">URL</option>
          </select>
        </label>
        <label>
          Порядок
          <select name="direction" value={direction} onChange={changeParameter}>
            <option value={SortOrder.ASC}>По возрастанию</option>
            <option value={SortOrder.DESC}>По убыванию</option>
          </select>
        </label>
        <label>
          На странице
          <select name="take" value={take} onChange={changeParameter}>
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size === 0 ? '0 (все)' : size}
              </option>
            ))}
          </select>
        </label>
        <Button variant="secondary" size="small" onClick={resetFilters}>
          Сбросить фильтры
        </Button>
      </div>
      {loading ? (
        <p role="status">Загрузка концептов…</p>
      ) : error ? (
        <p role="alert">
          Не удалось загрузить концепты. Попробуйте обновить страницу.
        </p>
      ) : (
        data && (
          <>
            <p>Всего концептов: {total}</p>
            <div className="grid-scroll">
              <ConceptGridStyled role="table" aria-label="Концепты">
                <ConceptRowStyled role="row">
                  {[
                    '',
                    'Имя',
                    'URL',
                    'Тип',
                    'Создан (МСК)',
                    'Обновлён (МСК)',
                    'Опубликован',
                    'Скрыт',
                    'В наличии',
                    'Цена',
                    'Качество',
                  ].map((title) => (
                    <div key={title} role="columnheader">
                      {title}
                    </div>
                  ))}
                </ConceptRowStyled>
                {data.concepts.map((concept) => (
                  <ConceptRow
                    key={concept.id}
                    concept={concept}
                    loading={
                      updateResult.loading &&
                      updateVariables?.where.id === concept.id
                    }
                    error={
                      updateVariables?.where.id === concept.id
                        ? updateResult.error?.message
                        : undefined
                    }
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                ))}
              </ConceptGridStyled>
            </div>
            {data.concepts.length === 0 && (
              <p>
                {total === 0
                  ? 'Концепты не найдены.'
                  : 'На этой странице нет концептов.'}
              </p>
            )}
            {page > pages ? (
              <button type="button" onClick={firstPage}>
                На первую страницу
              </button>
            ) : (
              <Pagination currentPage={page} totalPages={pages} />
            )}
          </>
        )
      )}
    </ConceptListStyled>
  )
}
