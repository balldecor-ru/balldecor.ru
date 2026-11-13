import { styled } from '@linaria/react'
import { theme } from '../../../theme'

export const ChatWidgetContainer = styled.div`
  position: fixed;
  bottom: max(16px, env(safe-area-inset-bottom));
  right: max(16px, env(safe-area-inset-right));
  z-index: 1000;

  @media (min-width: 560px) {
    bottom: max(24px, env(safe-area-inset-bottom));
    right: max(24px, env(safe-area-inset-right));
  }
`

export const ChatContentContainer = styled.div`
  display: grid;
  flex: 1;
  min-height: 0;
  overflow: auto;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;

  /* 
    This is so the scroll is inside the container, not the entire view
  */
  height: 100%;
  overflow: auto;

  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto auto;
  @media (min-width: 768px) {
    grid-template-rows: minmax(0, 1fr) auto 1fr;
  }
  &[data-has-messages='true'] {
    grid-template-rows: minmax(0, 1fr) auto;
    align-content: start;
  }
`

export const ChatWindow = styled.div`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  max-height: 100dvh;
  border-radius: 0;
  background: #f2f7fb;
  color: ${theme.colors.text.primary};
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: chatFadeIn 0.2s ease-out;
  @keyframes chatFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (min-width: 480px) {
    top: auto;
    left: auto;
    bottom: 20px;
    right: 20px;
    width: min(480px, calc(100vw - 40px));
    height: min(660px, calc(100dvh - 40px));
    max-height: calc(100dvh - 40px);
    border: 1px solid ${theme.colors.border};
    border-radius: 24px;
    box-shadow: 0 20px 64px rgba(32, 63, 86, 0.2);
    &[data-expanded='true'] {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      max-height: 100dvh;
      border-radius: 0;
      border: 0;
    }
  }
`

export const ChatHeader = styled.div`
  padding: 18px 20px;
  flex-shrink: 0;
  gap: 12px;
  background: ${theme.colors.primary};
  color: ${theme.colors.text.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
`

export const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: inherit;
`

export const ChatIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  > svg {
    width: 42px;
    height: 42px;
    padding: 10px;
    box-sizing: border-box;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
  }

  p {
    margin: 3px 0 0;
    font-size: 12px;
    color: #e3edf4;
  }
`

export const HeaderButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const HeaderButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: color 0.2s;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.15);
  }

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

export const ExpandButton = styled(HeaderButton)`
  display: none;

  @media (min-width: 560px) {
    display: flex;
  }
`

export const CloseButton = styled(HeaderButton)``

export const ChatMessages = styled.div`
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  overflow-anchor: none;
  padding: 24px;
  padding-bottom: calc(24px + var(--chat-response-space, 0px));

  > * {
    flex-shrink: 0;
  }
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 auto;
  width: 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`

export const ChatInputContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px 20px;
  background: transparent;
  grid-row: 2;
`

export const ChatForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 8px 8px 8px 16px;
  box-shadow: 0 4px 16px rgba(65, 103, 129, 0.06);
  border: 1px solid ${theme.colors.border};

  &:focus-within {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(65, 103, 129, 0.12);
  }
`

export const ChatTextarea = styled.textarea`
  flex: 1;
  min-width: 0;
  padding: 12px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  min-height: 24px;
  max-height: 200px;
  line-height: 1.5;

  &::placeholder {
    color: #9ca3af;
  }
`

export const SendButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #9ca3af;
  &[data-has-text='true'] {
    background: ${theme.colors.primary};
  }
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0;

  &:hover {
    background: #6b7280;
    &[data-has-text='true'] {
      background: ${theme.colors.linkHover};
    }
    transform: scale(1.05);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: #fff;
    margin-left: 2px;
  }
`

export const StopButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${theme.colors.primary};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0;

  &:hover {
    background: ${theme.colors.linkHover};
    transform: scale(1.05);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: #fff;
  }
`

export const TypingIndicator = styled.div`
  display: flex;
  gap: 5px;
  padding: 14px 18px;
  align-self: flex-start;
  background: #ffffff;
  border-radius: 20px;
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  span {
    width: 8px;
    height: 8px;
    background: #9ca3af;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`

export const WelcomeMessage = styled.div`
  text-align: center;
  padding: 32px 28px;
  color: ${theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  grid-row: 1;

  h4 {
    color: ${theme.colors.text.primary};
    margin: 0 0 12px;
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  p {
    margin: 0;
    max-width: 400px;
  }
`

export const ChatButton = styled.button`
  min-height: 52px;
  padding: 14px 20px;
  gap: 10px;
  border-radius: ${theme.radii.full};
  background: ${theme.colors.primary};
  color: ${theme.colors.text.light};
  font: 700 16px/1.25 ${theme.font};
  white-space: nowrap;

  @media (min-width: 560px) {
    min-height: 60px;
    padding: 16px 26px;
    font-size: 18px;
  }
  border: none;
  cursor: pointer;
  display: flex;
  &[data-open='true'] {
    display: none;
  }
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(65, 103, 129, 0.24);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &[data-animated='true'] {
    animation: chatButtonPulse 2.6s ease-in-out infinite;
  }

  @keyframes chatButtonPulse {
    0%,
    100% {
      box-shadow:
        0 8px 24px rgba(65, 103, 129, 0.24),
        0 0 0 0 rgba(65, 103, 129, 0.3);
    }
    50% {
      box-shadow:
        0 10px 28px rgba(65, 103, 129, 0.3),
        0 0 0 12px rgba(65, 103, 129, 0);
    }
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.primary};
    outline-offset: 4px;
  }

  &:hover:not(:disabled) {
    background: ${theme.colors.linkHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(65, 103, 129, 0.32);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  &[aria-busy='true'] svg {
    animation: chatButtonLoading 1s ease-in-out infinite alternate;
  }

  @keyframes chatButtonLoading {
    from {
      opacity: 0.35;
      transform: scale(0.85);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &[data-animated='true'],
    &[aria-busy='true'] svg {
      animation: none;
    }
  }

  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: block;
  }
`
