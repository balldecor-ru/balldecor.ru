import { styled } from '@linaria/react'
import { theme } from 'app/Custom/theme'

export const ConceptRowStyled = styled.div`
  display: contents;
  .price input {
    width: 9ch;
    padding: 5px 6px;
    border: 1px solid ${theme.colors.border};
    border-radius: 4px;
    font: inherit;
    text-align: right;
  }
  .price [role='alert'] {
    display: block;
    white-space: normal;
    max-width: 180px;
  }
  .quality-range {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 4px;
  }
  .quality-range button[data-size='small'] {
    box-sizing: border-box;
    flex: 0 0 24px;
    width: 24px;
    height: 34px;
    padding: 6px 0;
  }
  .quality input[type='range'] {
    flex: 0 0 90px;
    min-width: 0;
    width: 90px;
    height: 20px;
    margin: 0;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }
  .quality input[type='range']::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, #d64545, #999 50%, #299c50);
  }
  .quality input[type='range']::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, #d64545, #999 50%, #299c50);
  }
  .quality input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border: 2px solid #555;
    border-radius: 50%;
    background: #fff;
  }
  .quality input[type='range']::-moz-range-thumb {
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    border: 2px solid #555;
    border-radius: 50%;
    background: #fff;
  }
  .quality input:disabled {
    opacity: 0.5;
    cursor: default;
  }
  &:hover > [role='cell'] {
    background: ${theme.backgrounds.page};
  }
`
