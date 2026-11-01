export type OrderStatus = 'draft' | 'submitted'

export interface OrderRecord {
  id: string
  userId: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  submittedAt: number | null
  fullname: string | null
  email: string | null
  phone: string | null
  phoneAdditional: string | null
  address: string | null
  comment: string | null
  delivery: string | null
  payment: string | null
}

export interface OrderProductRecord {
  id: string
  orderId: string
  productId: string
  name: string
  image: string | null
  uri: string | null
  // Денежные значения хранятся в копейках.
  price: number
  oldPrice: number | null
  quantity: number
}

export type ProductSnapshot = Omit<
  OrderProductRecord,
  'id' | 'orderId' | 'quantity'
>
