import { styled } from '@linaria/react'
import { theme } from 'app/Custom/theme'

export const AddedPageStyled = styled.section`
  padding: 24px 0 48px;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const ActionsStyled = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
  a {
    padding: 12px 18px;
    border: 1px solid ${theme.colors.border};
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
  }
  a:first-child {
    background: #237a47;
    color: white;
  }
`

export const AddedSkeletonStyled = styled.div`
  display: grid;
  gap: 24px;
  > div {
    border-radius: 10px;
    background: linear-gradient(90deg, #edf0ed 25%, #f7f8f7 50%, #edf0ed 75%);
    background-size: 200% 100%;
    animation: added-skeleton 1.5s ease-in-out infinite;
  }
  .heading {
    width: 65%;
    height: 40px;
  }
  .product {
    height: 180px;
  }
  .recommendations {
    height: 240px;
  }
  .actions {
    width: 80%;
    height: 48px;
  }
  @keyframes added-skeleton {
    to {
      background-position: -200% 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    > div {
      animation: none;
    }
  }
`
