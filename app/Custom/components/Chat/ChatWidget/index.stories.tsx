import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatWidget as Component } from './'
import { ChatInputForm } from './ChatInputForm'
import { ChatMessage } from './ChatMessage'
import { ChatContent } from './ChatContent'
import { type ChatStoryState } from '../../../../../.storybook/decorators/withChatContext'
import {
  mockChatMessages,
  mockChatMessagesLong,
  mockStreamingMessages,
} from '../../../../../.storybook/mocks/chat'

const meta = {
  title: 'Components/ChatWidget',
  component: Component,
} satisfies Meta<typeof Component>

export default meta

type Story = StoryObj<typeof meta>

const chatState = (state: ChatStoryState) => ({ chatContext: state })

const withFrame: NonNullable<Story['decorators']> = [
  (Story) => (
    <>
      <Story />
    </>
  ),
]

export const Default: Story = {}

export const InputFormDefault: Story = {
  decorators: withFrame,
  render: () => <ChatInputForm />,
}

export const InputFormWithText: Story = {
  ...InputFormDefault,
  parameters: chatState({ initialMessage: 'Hello, how are you?' }),
}

export const InputFormWithTextLong: Story = {
  ...InputFormDefault,
  parameters: chatState({
    initialMessage: `There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.`,
  }),
}

export const InputFormDisabled: Story = {
  ...InputFormDefault,
  parameters: chatState({ isLoading: true }),
}

export const InputFormStreaming: Story = {
  ...InputFormDefault,
  parameters: chatState({ isLoading: true, showTypingIndicator: true }),
}

export const MessageUser: Story = {
  decorators: withFrame,
  render: () => <ChatMessage {...mockChatMessages[0]} />,
}

export const MessageBot: Story = {
  decorators: withFrame,
  render: () => <ChatMessage {...mockChatMessages[1]} />,
}

export const MessageBotStreaming: Story = {
  decorators: withFrame,
  render: () => <ChatMessage {...mockStreamingMessages[1]} />,
}

export const MessageBotEmpty: Story = {
  decorators: withFrame,
  render: () => <ChatMessage id="empty-bot" isUser={false} text="" />,
}

export const ChatConversation: Story = {
  decorators: [
    (Story) => (
      <div
        style={{ display: 'flex', width: '100%', maxWidth: 380, height: 400 }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: chatState({ messages: mockChatMessages }),
  render: () => <ChatContent />,
}

export const ChatConversationLongText: Story = {
  decorators: [
    (Story) => (
      <div
        style={{ display: 'flex', width: '100%', maxWidth: 380, height: 400 }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: chatState({ messages: mockChatMessagesLong }),
  render: () => <ChatContent />,
}

export const ChatWindowDefault: Story = {
  parameters: chatState({ isOpen: true }),
}

export const ChatWindowWithMessages: Story = {
  parameters: chatState({
    isOpen: true,
    messages: mockChatMessagesLong,
  }),
}

export const ChatWindowStreaming: Story = {
  parameters: chatState({
    isOpen: true,
    messages: mockStreamingMessages,
    isLoading: true,
    showTypingIndicator: true,
  }),
}
