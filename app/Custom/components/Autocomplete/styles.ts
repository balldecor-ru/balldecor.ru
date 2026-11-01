import { styled } from '@linaria/react'
import { theme } from 'app/Custom/theme'

export const Field = styled.div`
  position: relative;
  min-width: 0;
  input {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid ${theme.colors.border};
    border-radius: 10px;
    background: ${theme.colors.background};
    font: inherit;
    padding: 12px 48px 12px 12px;
    color: ${theme.colors.foreground};
  }
`
export const Popup = styled.div`
  z-index: 100;
  box-sizing: border-box;
  width: var(--autocomplete-width);
  max-width: calc(100vw - 24px);
  max-height: min(460px, 65vh);
  overflow: auto;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  background: ${theme.colors.background};
  color: ${theme.colors.foreground};
  box-shadow: ${theme.shadows.sm};
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  [role='option'] {
    padding: 10px 14px;
    cursor: pointer;
  }
`
export const GroupTitle = styled.div`
  padding: 12px 14px 6px;
  font-weight: 700;
  font-size: 0.9rem;
`
export const Status = styled.p`
  margin: 0;
  padding: 10px 14px;
  font-size: 0.9rem;
`

export const ClearButton = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  &:hover {
    background: #eaf3ee;
    color: ${theme.colors.primary};
  }
`
