import { styled } from '@linaria/react'
import { theme } from '../../theme'

export const StorefrontHeaderStyled = styled.header`
  position: relative;
  z-index: 1;
  .storefront-header-inner {
    width: min(100% - 40px, 1386px);
    margin: auto;
    padding: 18px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px 20px;
  }
  nav {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    order: 3;
    font-size: 11px;
    white-space: nowrap;
  }
  .phone {
    font-size: 13px;
    gap: 6px;
  }
  @media (min-width: 390px) {
    nav {
      font-size: 12px;
    }
  }
  @media (min-width: 560px) {
    nav {
      font-size: 15px;
    }
    .phone {
      font-size: 16px;
    }
  }
  @media (min-width: ${theme.breakpoints.md}px) {
    .storefront-header-inner {
      width: 87.4%;
      min-height: 100px;
      flex-wrap: nowrap;
      gap: 36px;
    }
    nav {
      order: initial;
      width: auto;
      justify-content: flex-start;
      gap: clamp(20px, 3.4vw, 54px);
      font-size: clamp(14px, 1.25vw, 19px);
    }
    .phone {
      margin-left: auto;
      font-size: clamp(14px, 1.5vw, 22px);
      gap: 8px;
    }
  }
`
