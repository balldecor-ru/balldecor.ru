import { styled } from '@linaria/react'
import { theme } from 'app/Custom/theme'

export const ConceptListStyled = styled.div`
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 12px;
  }
  label {
    display: grid;
    gap: 4px;
    max-width: 100%;
    font-size: 13px;
  }
  select {
    padding: 6px;
    max-width: 100%;
  }
  .grid-scroll {
    overflow-x: auto;
  }
  [role='alert'] {
    color: #a52424;
  }
`

export const ConceptGridStyled = styled.div`
  display: grid;
  grid-template-columns: 100px min-content auto repeat(8, min-content);
  font-size: 13px;
  [role='cell'],
  [role='columnheader'] {
    min-width: 0;
    padding: 6px 8px;
    border-bottom: 1px solid ${theme.colors.border};
    overflow-wrap: break-word;
  }
  [role='columnheader'] {
    font-weight: 600;
  }
  .uri {
    overflow-wrap: anywhere;
  }
  .price {
    white-space: nowrap;
    text-align: right;
  }
  time {
    white-space: nowrap;
  }
`
