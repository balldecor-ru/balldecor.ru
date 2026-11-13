import React, { useEffect, useState } from 'react'
import { useSnackbar } from 'app/Custom/hooks/useSnackbar'
import { ChatWidgetContainer, ChatButton } from './styles'
import { useChatContext } from './context'

type ChatComponents = {
  ChatContent: typeof import('./ChatContent').ChatContent
  ChatModal: typeof import('./ChatModal').ChatModal
}

export const ChatWidget: React.FC = () => {
  const chat = useChatContext()
  const snackbar = useSnackbar()
  const addMessage = snackbar?.addMessage
  const { isOpen, handleClose } = chat
  const [mounted, setMounted] = useState(false)
  const [components, setComponents] = useState<ChatComponents | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isOpen || components) {
      return
    }

    let cancelled = false

    Promise.all([import('./ChatContent'), import('./ChatModal')]).then(
      ([content, modal]) => {
        if (!cancelled) {
          setComponents({
            ChatContent: content.ChatContent,
            ChatModal: modal.ChatModal,
          })
        }
      },
      () => {
        if (!cancelled) {
          handleClose()
          addMessage?.('Не удалось загрузить чат. Попробуйте ещё раз.', {
            variant: 'error',
          })
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [mounted, isOpen, components, handleClose, addMessage])

  if (!mounted) {
    return null
  }

  const isLoading = isOpen && !components
  const isVisible = isOpen && !!components

  return (
    <ChatWidgetContainer>
      {isOpen && components && (
        <components.ChatModal
          isExpanded={chat.isExpanded}
          onClose={chat.handleClose}
          onExpand={chat.handleExpand}
        >
          <components.ChatContent />
        </components.ChatModal>
      )}

      <ChatButton
        aria-label="Спросить ИИ — открыть помощника"
        onClick={chat.handleToggle}
        data-open={isVisible}
        data-animated={!isOpen}
        disabled={isLoading}
        aria-busy={isLoading}
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" />
        </svg>
        <span>Спросить ИИ</span>
      </ChatButton>
    </ChatWidgetContainer>
  )
}
