import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const NewsConceptViewStyled = styled.div`
  display: grid;
  .news-item {
    max-width: 82ch;
    padding-block: 2rem;
    border-top: 1px solid ${theme.colors.divider};
  }
  .news-date {
    color: ${theme.colors.text.secondary};
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
`
