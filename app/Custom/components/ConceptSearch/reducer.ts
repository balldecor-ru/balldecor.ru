export interface SearchState {
  input: string
  suggestionQuery: string
  query: string
  take: number
}

export const initialSearchState: SearchState = {
  input: '',
  suggestionQuery: '',
  query: '',
  take: 20,
}

export type SearchAction =
  | { type: 'input'; value: string }
  | { type: 'suggest'; query: string }
  | { type: 'submit'; query: string }
  | { type: 'loadMore' }
  | { type: 'clear' }

export const searchReducer = (
  state: SearchState,
  action: SearchAction,
): SearchState => {
  switch (action.type) {
    case 'input':
      return { ...state, input: action.value, suggestionQuery: '' }
    case 'suggest':
      return action.query !== state.input.trim()
        ? state
        : { ...state, suggestionQuery: action.query }
    case 'submit':
      return { ...state, query: action.query, take: initialSearchState.take }
    case 'loadMore':
      return { ...state, take: state.take + initialSearchState.take }
    case 'clear':
      return initialSearchState
  }
}
