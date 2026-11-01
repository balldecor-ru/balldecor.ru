import { styled } from '@linaria/react'
export const AccountActionsStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  a,
  summary {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  details {
    position: relative;
  }
  .account-dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    width: min(260px, 80vw);
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    box-shadow: 0 8px 24px #0002;
    z-index: 10;
    overflow-wrap: anywhere;
  }
`
