import { useCallback, useId, useState } from 'react'
import {
  Controller,
  FormProvider,
  useForm,
  type ControllerProps,
} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  useSubmitOrderMutation,
  OrderDelivery,
  OrderPayment,
  type SubmitOrderMutationVariables,
  type OrderFragment,
} from 'app/gql/generated'
import { useAppContext } from 'app/Custom/hooks/useAppContext'
import { Button } from 'app/Custom/components/Button'
import { CheckoutStyled } from './styles'

type FormData = SubmitOrderMutationVariables['data']
const schema: yup.ObjectSchema<FormData> = yup.object({
  orderId: yup.string().required(),
  fullname: yup.string().trim().required('Укажите имя'),
  phone: yup.string().trim().required('Укажите телефон'),
  email: yup.string().email('Проверьте email').nullable(),
  phoneAdditional: yup.string().nullable(),
  address: yup
    .string()
    .nullable()
    .when('delivery', {
      is: (delivery: string) => delivery !== OrderDelivery.PICKUP,
      then: (field) => field.trim().required('Укажите адрес'),
    }),
  comment: yup.string().nullable(),
  delivery: yup
    .mixed<FormData['delivery']>()
    .oneOf([
      OrderDelivery.COURIER,
      OrderDelivery.PICKUP,
      OrderDelivery.TRANSPORT,
    ])
    .required(),
  payment: yup
    .mixed<FormData['payment']>()
    .oneOf([OrderPayment.CASH, OrderPayment.CARD, OrderPayment.INVOICE])
    .required(),
})
const labels = {
  fullname: 'Имя',
  phone: 'Телефон',
  email: 'Email',
  address: 'Адрес',
  comment: 'Комментарий',
}

export const Checkout: React.FC<{
  order: OrderFragment
  onSubmitted: () => Promise<unknown>
}> = ({ order, onSubmitted }) => {
  const { user } = useAppContext() ?? {}
  const [submitOrder] = useSubmitOrderMutation()
  const [error, setError] = useState('')
  const id = useId()
  const form = useForm<FormData>({
    defaultValues: {
      orderId: order.id,
      fullname: user?.fullname ?? '',
      email: user?.email ?? '',
      phone: '',
      address: '',
      comment: '',
      delivery: OrderDelivery.PICKUP,
      payment: OrderPayment.CASH,
    },
    resolver: yupResolver(schema),
  })
  const submit = useCallback(
    async (data: FormData) => {
      setError('')
      try {
        await submitOrder({ variables: { data } })
        if (localStorage.getItem('balldecor_current_order') === order.id) {
          localStorage.removeItem('balldecor_current_order')
        }
        await onSubmitted()
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Не удалось оформить заказ',
        )
      }
    },
    [submitOrder, onSubmitted, order.id],
  )
  const pending = form.formState.isSubmitting
  const renderText = useCallback<
    ControllerProps<FormData, keyof typeof labels>['render']
  >(
    ({ field, fieldState }) => (
      <label htmlFor={`${id}-${field.name}`}>
        {labels[field.name]}
        <input
          {...field}
          id={`${id}-${field.name}`}
          value={field.value ?? ''}
          disabled={pending}
          aria-invalid={!!fieldState.error}
        />
        {fieldState.error && (
          <span role="alert">{fieldState.error.message}</span>
        )}
      </label>
    ),
    [id, pending],
  )
  const renderDelivery = useCallback<
    ControllerProps<FormData, 'delivery'>['render']
  >(
    ({ field }) => (
      <label>
        Получение
        <select {...field} disabled={pending}>
          <option value="pickup">Самовывоз</option>
          <option value="courier">Доставка</option>
          <option value="transport">Срочная доставка</option>
        </select>
      </label>
    ),
    [pending],
  )
  const renderPayment = useCallback<
    ControllerProps<FormData, 'payment'>['render']
  >(
    ({ field }) => (
      <label>
        Оплата
        <select {...field} disabled={pending}>
          <option value="cash">Наличными при получении</option>
          <option value="card">Картой при получении</option>
          <option value="invoice">По счёту</option>
        </select>
      </label>
    ),
    [pending],
  )
  return (
    <FormProvider {...form}>
      <CheckoutStyled onSubmit={form.handleSubmit(submit)}>
        <h3>Оформление заказа</h3>
        {(Object.keys(labels) as (keyof typeof labels)[]).map((name) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={renderText}
          />
        ))}
        <Controller
          name="delivery"
          control={form.control}
          render={renderDelivery}
        />
        <Controller
          name="payment"
          control={form.control}
          render={renderPayment}
        />
        {error && <p role="alert">{error}</p>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Отправка…' : 'Оформить заказ'}
        </Button>
      </CheckoutStyled>
    </FormProvider>
  )
}
