import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const ServicesConceptViewStyled = styled.div`
  .services .serv {
    display: grid;
    align-content: start;
    gap: 14px;
  }
  .serv img {
    width: 100%;
    aspect-ratio: 16/10;
    object-fit: cover;
    border-radius: ${theme.radii.lg};
  }
  .intro {
    color: ${theme.colors.foreground};
  }
  .title {
    color: ${theme.colors.link};
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
`
