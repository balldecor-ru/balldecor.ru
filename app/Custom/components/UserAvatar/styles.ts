import { styled } from '@linaria/react'
import { theme } from 'app/Custom/theme'

export const UserAvatarStyled = styled.span`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 50%;
  background: #e4eadf;
  color: ${theme.colors.text.primary};
  font-weight: 700;
  line-height: 1;

  > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`
