import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const ContactsConceptViewStyled = styled.div`
  #map {
    margin-bottom: var(--section-gap);
    padding: clamp(24px, 5vw, 64px);
    background: ${theme.colors.gray[50]};
    border-radius: ${theme.radii.lg};
  }
  address {
    max-width: 44ch;
    font-size: clamp(20px, 2.5vw, 32px);
  }
  #content-body {
    display: grid;
    gap: 32px;
  }
  #content-body > .clearfix,
  #content-body > .row:empty {
    display: none;
  }
  .feedback-form {
    display: grid;
    gap: 12px;
    justify-items: start;
  }
  @media (min-width: 800px) {
    #content-body {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    }
  }
`
