import * as React from 'react'
import { X } from 'lucide-react'
import {
  useComboBox,
  useListBox,
  useListBoxSection,
  useOption,
  useOverlay,
  useOverlayPosition,
  mergeProps,
  OverlayContainer,
  DismissButton,
  useIsSSR,
  type AriaListBoxOptions,
} from 'react-aria'
import {
  useComboBoxState,
  Item,
  Section,
  type ComboBoxState,
} from 'react-stately'
import type { Node } from '@react-types/shared'
import { Field, Popup, GroupTitle, Status, ClearButton } from './styles'

export interface AutocompleteOption {
  id: string
  text: string
  content?: React.ReactNode
}
export interface AutocompleteGroup {
  id: string
  label: string
  hideLabel?: boolean
  items: AutocompleteOption[]
}
interface AutocompleteProps {
  inputRef?: React.RefObject<HTMLInputElement | null>
  anchorRef?: React.RefObject<HTMLElement | null>
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  search: (query: string) => void | Promise<void>
  groups: AutocompleteGroup[]
  loading: boolean
  error?: string
  renderEmptyContent?: (close: () => void) => React.ReactNode
  onSelect: (id: string) => void
  onSubmit: () => void
  onClear: () => void
}

const Option: React.FC<{
  item: Node<AutocompleteOption>
  state: ComboBoxState<AutocompleteOption>
}> = ({ item, state }) => {
  const ref = React.useRef<HTMLLIElement>(null)
  const { optionProps, isFocused } = useOption({ key: item.key }, state, ref)
  return (
    <li {...optionProps} ref={ref} data-focused={isFocused}>
      {item.rendered}
    </li>
  )
}
const Group: React.FC<{
  section: Node<AutocompleteOption>
  state: ComboBoxState<AutocompleteOption>
}> = ({ section, state }) => {
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  })
  return (
    <li {...itemProps}>
      {section.rendered && (
        <GroupTitle {...headingProps}>{section.rendered}</GroupTitle>
      )}
      <ul {...groupProps}>
        {Array.from(
          state.collection.getChildren?.(section.key) ?? [],
          (item) => (
            <Option key={item.key} item={item} state={state} />
          ),
        )}
      </ul>
    </li>
  )
}

const Suggestions: React.FC<{
  state: ComboBoxState<AutocompleteOption>
  listBoxProps: AriaListBoxOptions<AutocompleteOption>
  listBoxRef: React.RefObject<HTMLUListElement | null>
  popoverRef: React.RefObject<HTMLDivElement | null>
  triggerRef: React.RefObject<HTMLElement | null>
  loading: boolean
  error?: string
  renderEmptyContent?: (close: () => void) => React.ReactNode
}> = ({
  state,
  listBoxProps,
  listBoxRef,
  triggerRef,
  popoverRef,
  loading,
  error,
  renderEmptyContent,
}) => {
  const { overlayProps } = useOverlay(
    { isOpen: state.isOpen, onClose: state.close, isDismissable: true },
    popoverRef,
  )
  const { overlayProps: positionProps, updatePosition } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef: popoverRef,
    placement: 'bottom start',
    shouldFlip: false,
    offset: 4,
    isOpen: state.isOpen,
  })
  const popoverProps = mergeProps(overlayProps, positionProps)
  const { listBoxProps: props } = useListBox(
    { ...listBoxProps, autoFocus: state.focusStrategy ?? undefined },
    state,
    listBoxRef,
  )
  React.useLayoutEffect(() => {
    const anchor = triggerRef.current
    const popup = popoverRef.current
    if (!anchor || !popup) {
      return
    }
    const resize = (): void => {
      popup.style.setProperty(
        '--autocomplete-width',
        `${anchor.getBoundingClientRect().width}px`,
      )
      updatePosition()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(anchor)
    return () => observer.disconnect()
  }, [triggerRef, popoverRef, updatePosition])
  return (
    <OverlayContainer>
      <Popup {...popoverProps} ref={popoverRef}>
        <DismissButton onDismiss={state.close} />
        {loading && <Status role="status">Поиск…</Status>}
        {error && <Status role="alert">{error}</Status>}
        {!loading && !error && state.collection.size === 0 && (
          <>
            <Status role="status">Ничего не найдено</Status>
            {renderEmptyContent?.(state.close)}
          </>
        )}
        <ul {...props} ref={listBoxRef}>
          {Array.from(state.collection, (item) =>
            item.type === 'section' ? (
              <Group key={item.key} section={item} state={state} />
            ) : (
              <Option key={item.key} item={item} state={state} />
            ),
          )}
        </ul>
        <DismissButton onDismiss={state.close} />
      </Popup>
    </OverlayContainer>
  )
}

const acceptAll = (): boolean => true

export const Autocomplete: React.FC<AutocompleteProps> = ({
  anchorRef,
  inputRef: suppliedInputRef,
  label,
  placeholder,
  value,
  onChange,
  search,
  groups,
  loading,
  error,
  renderEmptyContent,
  onSelect,
  onSubmit,
  onClear,
}) => {
  const isSSR = useIsSSR()
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const internalInputRef = React.useRef<HTMLInputElement>(null)
  const inputRef = suppliedInputRef ?? internalInputRef
  const listBoxRef = React.useRef<HTMLUListElement>(null)
  React.useEffect(() => {
    if (!value.trim()) {
      return
    }
    const timer = setTimeout(() => {
      void search(value)
    }, 250)
    return () => clearTimeout(timer)
  }, [value, search])
  const children = React.useMemo(
    () =>
      groups
        .filter((group) => group.items.length)
        .map((group) => (
          <Section
            key={group.id}
            title={group.hideLabel ? undefined : group.label}
            aria-label={group.label}
          >
            {group.items.map((item) => (
              <Item key={item.id} textValue={item.text}>
                {item.content ?? item.text}
              </Item>
            ))}
          </Section>
        )),
    [groups],
  )
  const props = {
    isDisabled: isSSR,
    'aria-label': label,
    inputValue: value,
    onInputChange: onChange,
    selectedKey: null,
    allowsCustomValue: true,
    allowsEmptyCollection: true,
    children,
  }
  const state = useComboBoxState<AutocompleteOption>({
    ...props,
    defaultFilter: acceptAll,
    onSelectionChange: (key: React.Key | null): void => {
      if (key !== null) {
        state.close()
        onSelect(String(key))
      }
    },
  })
  const { inputProps, listBoxProps } = useComboBox(
    { ...props, inputRef, listBoxRef, popoverRef },
    state,
  )
  const clear = React.useCallback((): void => {
    state.close()
    onClear()
    inputRef.current?.focus()
  }, [state, onClear, inputRef])
  const keyDown = React.useCallback<
    React.KeyboardEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (
        event.key === 'Enter' &&
        !event.nativeEvent.isComposing &&
        (!state.isOpen || !state.selectionManager.focusedKey)
      ) {
        event.preventDefault()
        state.close()
        onSubmit()
        return
      }
      inputProps.onKeyDown?.(event)
    },
    [state, onSubmit, inputProps],
  )
  return (
    <Field>
      <input
        {...inputProps}
        onKeyDown={keyDown}
        ref={inputRef}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <ClearButton
          data-react-aria-top-layer
          type="button"
          aria-label="Сбросить поиск"
          title="Сбросить поиск"
          onClick={clear}
        >
          <X size={18} aria-hidden="true" />
        </ClearButton>
      )}
      {state.isOpen && value.trim() && (
        <Suggestions
          popoverRef={popoverRef}
          state={state}
          listBoxProps={listBoxProps}
          listBoxRef={listBoxRef}
          triggerRef={anchorRef ?? inputRef}
          loading={loading}
          error={error}
          renderEmptyContent={renderEmptyContent}
        />
      )}
    </Field>
  )
}
