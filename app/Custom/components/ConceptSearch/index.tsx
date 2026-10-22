import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, Search } from 'lucide-react'
import { useSearchConceptsQuery } from 'app/gql/generated'
import { Autocomplete, type AutocompleteGroup } from '../Autocomplete'
import { ConceptSearchCard } from '../ConceptItem/Search'
import { Wrap, Results } from './styles'
import { initialSearchState, searchReducer } from './reducer'

export const ConceptSearch: React.FC = () => {
  const [state, dispatch] = React.useReducer(searchReducer, initialSearchState)
  const { input, suggestionQuery: suggestion, query, take } = state
  const inputRef = React.useRef<HTMLInputElement>(null)
  const anchor = React.useRef<HTMLFormElement>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const scrolling = React.useRef(false)
  const hasInput = Boolean(input.trim())
  React.useEffect(() => {
    const field = anchor.current
    if (!hasInput || !field) {
      return
    }
    // Шапка главной страницы прокручивается вместе со страницей.
    const start = window.scrollY
    const target = Math.max(0, start + field.getBoundingClientRect().top - 16)
    if (Math.abs(target - start) < 1) {
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: target, behavior: 'instant' })
      return
    }
    scrolling.current = true
    const startedAt = performance.now()
    let frame: number
    const animate = (now: number): void => {
      const progress = Math.min((now - startedAt) / 500, 1)
      const eased = 1 - (1 - progress) ** 3
      window.scrollTo({
        top: start + (target - start) * eased,
        behavior: 'instant',
      })
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      } else {
        scrolling.current = false
      }
    }
    frame = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(frame)
      scrolling.current = false
    }
  }, [hasInput])
  const suggestions = useSearchConceptsQuery({
    variables: { query: suggestion, take: 8 },
    skip: !suggestion,
    fetchPolicy: 'network-only',
  })
  const results = useSearchConceptsQuery({
    variables: { query, take },
    skip: !query,
    fetchPolicy: 'network-only',
  })
  const pending = input.trim() !== suggestion
  const items =
    !pending && !suggestions.loading
      ? suggestions.data?.searchConcepts.items
      : undefined
  const groups = React.useMemo<AutocompleteGroup[]>(
    () => [
      {
        id: 'concepts',
        label: 'Результаты поиска',
        hideLabel: true,
        items: (items ?? []).map((concept) => ({
          id: concept.id,
          text: concept.name,
          content: <ConceptSearchCard concept={concept} />,
        })),
      },
    ],
    [items],
  )
  const setInput = React.useCallback(
    (value: string): void => {
      dispatch({ type: 'input', value })
      // После анимации сохраняем положение поля при автопрокрутке браузера к каретке.
      if (hasInput && value.trim() && !scrolling.current) {
        requestAnimationFrame(() => {
          const field = anchor.current
          if (
            field &&
            document.activeElement === inputRef.current &&
            !scrolling.current
          ) {
            window.scrollTo({
              top: window.scrollY + field.getBoundingClientRect().top - 16,
              behavior: 'instant',
            })
          }
        })
      }
    },
    [hasInput],
  )
  const search = React.useCallback(
    (value: string): void => dispatch({ type: 'suggest', query: value.trim() }),
    [],
  )
  const clear = React.useCallback((): void => {
    dispatch({ type: 'clear' })
  }, [])
  const submit = React.useCallback((): void => {
    if (!input.trim()) {
      return
    }
    dispatch({ type: 'submit', query: input.trim() })
    if (query === input.trim()) {
      void results
        .refetch({ query, take: initialSearchState.take })
        .catch(() => undefined)
    }
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ block: 'nearest' })
      resultsRef.current?.focus()
    })
  }, [input, query, results])
  const select = React.useCallback(
    (id: string): void => {
      const concept = items?.find((item) => item.id === id)
      if (concept) {
        void navigate(concept.uri)
      }
    },
    [items, navigate],
  )
  const handleSubmit = React.useCallback<
    React.SubmitEventHandler<HTMLFormElement>
  >(
    (event) => {
      event.preventDefault()
      submit()
    },
    [submit],
  )
  const loadMore = React.useCallback(
    (): void => dispatch({ type: 'loadMore' }),
    [],
  )
  const focusInput = React.useCallback<
    React.MouseEventHandler<HTMLFormElement>
  >((event) => {
    const target = event.target
    // События портала подсказок также всплывают через React-дерево формы.
    if (
      !(target instanceof Element) ||
      !event.currentTarget.contains(target) ||
      target.closest('button, a, input')
    ) {
      return
    }
    if (document.activeElement !== inputRef.current) {
      inputRef.current?.focus()
    }
  }, [])
  return (
    <Wrap className="catalog-search">
      <p className="search-label">Поиск по каталогу</p>
      <form
        ref={anchor}
        className="search-field"
        role="search"
        onSubmit={handleSubmit}
        onClick={focusInput}
      >
        <Search aria-hidden="true" size={27} strokeWidth={1.5} />
        <Autocomplete
          anchorRef={anchor}
          inputRef={inputRef}
          label="Поиск по каталогу"
          placeholder="Например, шары на день рождения"
          value={input}
          onChange={setInput}
          search={search}
          groups={groups}
          loading={Boolean(input.trim()) && (pending || suggestions.loading)}
          error={
            !pending && suggestions.error
              ? 'Не удалось выполнить поиск. Попробуйте ещё раз.'
              : undefined
          }
          onSelect={select}
          onSubmit={submit}
          onClear={clear}
        />
        <button
          className="search-submit"
          type="submit"
          disabled={!input.trim()}
        >
          Найти
        </button>
      </form>
      <div className="quick-categories">
        <Link to="/katalog-sharov-i-figur/czifryi-iz-sharov.html">
          Шары-цифры <ArrowRight aria-hidden="true" />
        </Link>
        <Link to="/katalog-sharov-i-figur/lateksnyie-shariki-s-geliem.html">
          С гелием <ArrowRight aria-hidden="true" />
        </Link>
        <Link to="/services/sharyi-s-konfetti.html">
          С конфетти <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      {query && (
        <Results ref={resultsRef} tabIndex={-1} aria-label="Результаты поиска">
          <p role="status">
            {results.loading
              ? 'Поиск…'
              : results.error
                ? 'Не удалось выполнить поиск. Попробуйте ещё раз.'
                : `Найдено: ${results.data?.searchConcepts.total ?? 0}`}
          </p>
          {!results.loading && !results.error && (
            <>
              <ul>
                {results.data?.searchConcepts.items.map((concept) => (
                  <li key={concept.id}>
                    <Link to={concept.uri}>
                      <ConceptSearchCard concept={concept} />
                    </Link>
                  </li>
                ))}
              </ul>
              {(results.data?.searchConcepts.total ?? 0) >
                (results.data?.searchConcepts.items.length ?? 0) && (
                <button type="button" onClick={loadMore}>
                  Показать ещё
                </button>
              )}
            </>
          )}
        </Results>
      )}
    </Wrap>
  )
}
