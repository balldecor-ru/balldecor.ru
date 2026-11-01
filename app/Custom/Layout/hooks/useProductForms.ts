import { useCallback, useEffect, useState } from 'react'

export function useProductForms(): {
  productId: string | null
  close: () => void
} {
  const [productId, setProductId] = useState<string | null>(null)
  const close = useCallback(() => setProductId(null), [])

  useEffect(() => {
    const onSubmit = (event: SubmitEvent): void => {
      const form = event.target
      if (
        !(form instanceof HTMLFormElement) ||
        !form.matches('.product-form')
      ) {
        return
      }
      event.preventDefault()
      const id = String(new FormData(form).get('product_id') ?? '')
      setProductId(id.startsWith('old:page:') ? id : `old:page:${id}`)
    }
    document.addEventListener('submit', onSubmit)
    return () => document.removeEventListener('submit', onSubmit)
  }, [])

  return { productId, close }
}
