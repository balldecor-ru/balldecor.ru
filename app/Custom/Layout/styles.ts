import { styled } from '@linaria/react'
import { theme } from '../theme'

export const CustomLayoutSectionStyled = styled.section`
  max-width: 1328px;
  padding: 44px 24px;
  margin: auto;

  @media (min-width: ${theme.breakpoints.sm}px) {
    padding: 64px 40px;
  }
`

export const CustomLayoutGridStyled = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;

  @media (min-width: ${theme.breakpoints.xs}px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${theme.breakpoints.sm}px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
`

export const CustomLayoutMainStyled = styled.main`
  flex: 1;
  min-width: 0;
`

export const CustomLayoutStyled = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: ${theme.colors.foreground};
  background: ${theme.backgrounds.page};
  position: relative;
  .brand {
    font-family: 'Great Vibes', cursive;
    font-size: clamp(36px, 3.5vw, 56px);
    color: ${theme.colors.primary};
    line-height: 1;
    white-space: nowrap;
  }
  .phone {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: ${theme.colors.primary};
    white-space: nowrap;
  }
  > header a,
  > footer a {
    color: ${theme.colors.link};
    transition: color ${theme.transitions.fast};
  }
  > header nav a,
  > footer nav a {
    font-weight: 600;
  }
  > header a:is(:hover, :focus-visible),
  > footer a:is(:hover, :focus-visible) {
    color: ${theme.colors.linkHover};
    border-radius: ${theme.radii.sm};
  }
  &:has(> main > [data-home-page]) > header {
    position: absolute;
    inset: 0 0 auto;
  }
  .ai-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 14px 20px;
    background: ${theme.colors.primary};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;
    transition: background 0.2s;
    text-decoration: none;
  }
  .ai-button:hover {
    background: #28583f;
    text-decoration: none;
  }
  .skip-link {
    position: absolute;
    top: -100px;
    left: 20px;
    padding: 12px 20px;
    background: white;
    z-index: 1100;
  }
  .skip-link:focus {
    top: 12px;
  }

  .carousel.slide {
    .carousel-indicators,
    .carousel-control {
      display: none;
    }
  }
`
