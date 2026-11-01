import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '../../Button'
import { AddProductDialog, type AddProduct } from './AddProductDialog'

export const AddProductButton: React.FC<{ product: AddProduct }> = ({
  product,
}) => {
  const [params] = useSearchParams()
  const [open, setOpen] = useState(params.get('add') === '1')
  const [initialQuantity, setInitialQuantity] = useState(
    Number(params.get('quantity') || 1),
  )
  const show = useCallback(() => {
    setInitialQuantity(1)
    setOpen(true)
  }, [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <Button
        onClick={show}
        disabled={product.available === false || !product.price}
      >
        В корзину
      </Button>
      {open && (
        <AddProductDialog
          productId={product.id}
          product={product}
          initialQuantity={initialQuantity}
          onClose={close}
        />
      )}
    </>
  )
}
