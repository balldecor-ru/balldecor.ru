import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const PaletteConceptViewStyled = styled.div`
  .box {
    min-width: 0;
    padding: clamp(14px, 3vw, 32px);
    background: ${theme.colors.gray[50]};
    border-radius: ${theme.radii.lg};
  }
  .result-item {
    margin-block: 0.5em;
  }
  .result-value {
    color: ${theme.colors.primary};
    font-weight: 600;
  }
  .nav-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    padding: 0;
    margin-top: 2rem;
  }
  .nav-tabs li:not(.active) .btn {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.primary};
  }
  .tab-pane:not(.active) {
    display: none;
  }
  .palette-item {
    display: inline-block;
    vertical-align: top;
    margin: 4px;
  }
  .palette-item label {
    display: inline-grid;
    justify-items: center;
    width: 6em;
    cursor: pointer;
  }
  .palette-img {
    width: 42px;
  }
  .palette-name {
    font-size: 0.85rem;
    text-align: center;
  }
  .option-row {
    margin: 0.6em 0;
  }
`
