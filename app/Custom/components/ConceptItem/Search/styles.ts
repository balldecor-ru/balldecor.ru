import { styled } from '@linaria/react'
export const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  min-height: 64px;
  font-size: 16px;
  line-height: 1.4;
  img {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    object-fit: contain;
    background: white;
    border-radius: 6px;
  }
  span {
    overflow-wrap: anywhere;
  }
`
