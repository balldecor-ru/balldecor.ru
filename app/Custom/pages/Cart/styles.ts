import { styled } from '@linaria/react'
export const CartStyled = styled.section`
  max-width: 1000px;
  margin: 24px auto;
  padding: 16px;
  article {
    padding: 16px 0;
    border-bottom: 1px solid #ddd;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }
  article img {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }
  article input {
    width: 80px;
    padding: 8px;
  }
`
export const CheckoutStyled = styled.form`
  display: grid;
  gap: 12px;
  max-width: 600px;
  label {
    display: grid;
    gap: 6px;
  }
  input,
  select {
    padding: 10px;
    border: 1px solid #bbb;
    border-radius: 6px;
  }
`
