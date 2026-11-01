import { useCallback, useEffect, useRef, useState, useId } from 'react'
import {
  Controller,
  FormProvider,
  useForm,
  type ControllerProps,
} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  useConceptQuery,
  type OrderAddProductMutationVariables,
} from 'app/gql/generated'
import { useAddProduct, addProductSchema } from './useAddProduct'
import { Button } from '../../Button'
import { FeedbackDialog } from '../../Feedback/styles'

type FormData = OrderAddProductMutationVariables['data']
export type AddProduct = {
  id: string
  name: string
  price?: number | null
  available?: boolean | null
}

export const AddProductDialog: React.FC<{
  productId: string
  product?: AddProduct
  initialQuantity?: number
  onClose: () => void
}> = ({ productId, product: initialProduct, initialQuantity = 1, onClose }) => {
  const {
    data,
    loading,
    error: queryError,
  } = useConceptQuery({
    variables: { where: { id: productId }, detailedInfo: false },
    skip: !!initialProduct,
  })
  const product = initialProduct ?? data?.concept
  const [error, setError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()
  const addProduct = useAddProduct()
  const form = useForm<FormData>({
    defaultValues: {
      productId,
      quantity:
        Number.isSafeInteger(initialQuantity) &&
        initialQuantity > 0 &&
        initialQuantity <= 1000000
          ? initialQuantity
          : 1,
    },
    resolver: yupResolver(addProductSchema),
  })
  const quantity = form.watch('quantity')
  const pending = form.formState.isSubmitting
  const close = useCallback(() => {
    if (!pending) {
      onClose()
    }
  }, [pending, onClose])
  const cancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault()
      close()
    },
    [close],
  )
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  const submit = useCallback(
    async (data: FormData) => {
      setError('')
      try {
        await addProduct(data)
        onClose()
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Не удалось добавить товар',
        )
      }
    },
    [addProduct, onClose],
  )
  const renderQuantity = useCallback<
    ControllerProps<FormData, 'quantity'>['render']
  >(
    ({ field, fieldState }) => (
      <label>
        Количество
        <input
          {...field}
          type="number"
          min={1}
          max={1000000}
          disabled={pending}
          aria-invalid={!!fieldState.error}
        />
        {fieldState.error && (
          <span role="alert">{fieldState.error.message}</span>
        )}
      </label>
    ),
    [pending],
  )
  return (
    <FeedbackDialog ref={dialog} onCancel={cancel} aria-labelledby={id}>
      <button
        type="button"
        className="close"
        onClick={close}
        disabled={pending}
        aria-label="Закрыть"
      >
        ×
      </button>
      <h2 id={id}>{product?.name ?? 'Добавление товара'}</h2>
      {loading && <p>Загрузка…</p>}
      {queryError && <p role="alert">{queryError.message}</p>}
      {!loading && !queryError && !product && (
        <p role="alert">Товар не найден</p>
      )}
      {product && (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(submit)}>
            <p>Цена {product.price?.toLocaleString('ru-RU')} ₽</p>
            <Controller
              control={form.control}
              name="quantity"
              render={renderQuantity}
            />
            <p>
              Итого{' '}
              {Number.isFinite(Number(quantity))
                ? ((product.price ?? 0) * quantity).toLocaleString('ru-RU')
                : '—'}{' '}
              ₽
            </p>
            {error && <p role="alert">{error}</p>}
            <Button
              type="submit"
              disabled={
                pending || product.available === false || !product.price
              }
            >
              {pending ? 'Добавление…' : 'Добавить в корзину'}
            </Button>
          </form>
        </FormProvider>
      )}
    </FeedbackDialog>
  )
}
