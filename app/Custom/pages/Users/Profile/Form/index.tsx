import { useCallback, useState, useId } from 'react'
import {
  Controller,
  FormProvider,
  useForm,
  type ControllerProps,
} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  useUpdateCurrentUserMutation,
  type UpdateCurrentUserMutationVariables,
  type MeUserFragment,
} from 'app/gql/generated'
import { signUpSchema } from 'app/Custom/components/Auth/SignUpForm/schema'
import { Button } from 'app/Custom/components/Button'
import { ProfileFormStyled } from './styles'

type FormData = Pick<
  UpdateCurrentUserMutationVariables['data'],
  'fullname' | 'email' | 'password'
>
const schema: yup.ObjectSchema<FormData> = yup.object({
  fullname: yup.string().trim().nullable(),
  email: yup.string().trim().email('Проверьте email').nullable(),
  password: yup
    .string()
    .nullable()
    .test(
      'password',
      'Пароль: минимум 8 символов, строчная и заглавная латинские буквы и цифра',
      (value) =>
        !value ||
        (yup.reach(signUpSchema, 'password') as yup.StringSchema).isValidSync(
          value,
        ),
    ),
})

export const CustomerProfileForm: React.FC<{
  user: MeUserFragment
  loading?: boolean
}> = ({ user, loading = false }) => {
  const id = useId()
  const [update] = useUpdateCurrentUserMutation()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const openPassword = useCallback(() => setShowPassword(true), [])
  const form = useForm<FormData>({
    defaultValues: {
      fullname: user?.fullname ?? '',
      email: user?.email ?? '',
      password: '',
    },
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  })
  const save = useCallback(
    async (data: FormData) => {
      if (loading) {
        return
      }
      setMessage('')
      setError('')
      try {
        const result = await update({
          variables: {
            data: { ...data, password: data.password || undefined },
          },
        })
        if (!result.data?.response) {
          throw new Error('Не удалось сохранить профиль')
        }
        form.setValue('password', '')
        setShowPassword(false)
        setMessage('Профиль сохранён.')
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Не удалось сохранить профиль',
        )
      }
    },
    [update, form, loading],
  )
  const renderField = useCallback<ControllerProps<FormData>['render']>(
    ({ field, fieldState }) => {
      const name = field.name
      return (
        <div className="field">
          <label htmlFor={`${id}-${name}`}>
            {
              {
                fullname: 'Ваше имя',
                email: 'Email',
                password: user?.email ? 'Новый пароль' : 'Пароль для входа',
              }[name]
            }
          </label>
          <input
            {...field}
            value={field.value ?? ''}
            id={`${id}-${name}`}
            type={
              name === 'password'
                ? 'password'
                : name === 'email'
                  ? 'email'
                  : 'text'
            }
            autoComplete={
              name === 'password'
                ? 'new-password'
                : name === 'email'
                  ? 'email'
                  : 'name'
            }
            disabled={loading || form.formState.isSubmitting}
            aria-invalid={!!fieldState.error}
            aria-describedby={
              fieldState.error ? `${id}-${name}-error` : undefined
            }
          />
          {fieldState.error && (
            <span id={`${id}-${name}-error`} role="alert">
              {fieldState.error.message}
            </span>
          )}
        </div>
      )
    },
    [id, user?.email, form.formState.isSubmitting, loading],
  )
  return (
    <ProfileFormStyled onSubmit={form.handleSubmit(save)} noValidate>
      <FormProvider {...form}>
        {(['fullname', 'email'] as const).map((name) => (
          <Controller
            key={name}
            control={form.control}
            name={name}
            render={renderField}
          />
        ))}
        {showPassword ? (
          <>
            <Controller
              control={form.control}
              name="password"
              render={renderField}
            />
          </>
        ) : (
          <div>
            <Button
              variant="secondary"
              onClick={openPassword}
              disabled={loading || form.formState.isSubmitting}
            >
              Сменить пароль
            </Button>
          </div>
        )}

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <div>
          <Button
            type="submit"
            disabled={loading || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Сохранение…' : 'Сохранить профиль'}
          </Button>
        </div>
      </FormProvider>
    </ProfileFormStyled>
  )
}
