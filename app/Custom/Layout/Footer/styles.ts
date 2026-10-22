import { styled } from '@linaria/react'
import { theme } from '../../theme'

export const FooterStyled = styled.footer`
  width: min(100% - 40px, 1386px);
  margin: 40px auto 0;
  border-top: 1px solid ${theme.colors.border};
  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 24px 40px;
    align-items: center;
    padding: 34px 0 44px;
  }
  nav {
    display: flex;
    gap: 36px;
    font-size: 14px;
  }
  p {
    margin-top: 12px;
    font-size: 13px;
    color: ${theme.colors.text.secondary};
  }
  .phone {
    font-size: 17px;
  }
  @media (min-width: ${theme.breakpoints.sm}px) {
    width: 87.4%;
    max-width: 1386px;
    margin-top: 48px;
    .footer-inner {
      gap: 70px;
      padding: 40px 0 58px;
    }
    .phone {
      margin-left: auto;
    }
  }
`
