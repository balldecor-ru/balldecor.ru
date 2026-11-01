import { styled } from '@linaria/react'
import { theme } from '../../theme'
export const Wrap = styled.div`
  .search-label {
    display: block;
    margin-bottom: 9px;
    color: ${theme.colors.primary};
    font-size: 15px;
  }
  .search-field {
    cursor: text;
  }
  .search-field > div {
    flex: 1;
    align-self: stretch;
    min-width: 0;
  }
  .search-field input {
    height: 100%;
    padding: 0 36px 0 0;
  }
  .search-field .search-submit {
    cursor: pointer;
  }
  .search-field .search-submit:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .search-field > div button {
    right: 0;
    padding: 0;
    min-width: 0;
    background: transparent;
    color: ${theme.colors.primary};
    cursor: pointer;
  }
  @media (min-width: ${theme.breakpoints.md}px) {
    .search-label {
      font-size: clamp(14px, 1.25vw, 20px);
    }
  }
`
export const Results = styled.div`
  margin-top: 18px;
  padding: 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  background: white;
  max-height: 520px;
  overflow: auto;
  ul {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;
  }
  li + li {
    border-top: 1px solid ${theme.colors.border};
  }
  a {
    display: block;
    padding: 10px 0;
    color: inherit;
    text-decoration: none;
  }
  a:is(:hover, :focus-visible) {
    color: ${theme.colors.linkHover};
  }
  button {
    padding: 10px 16px;
    border: 1px solid ${theme.colors.border};
    border-radius: 6px;
    background: white;
    color: ${theme.colors.primary};
    cursor: pointer;
  }
`
