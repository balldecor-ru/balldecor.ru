import type { ChatTool } from '../types'

export const registerContactRequestTool: ChatTool = {
  definition: {
    type: 'function',
    function: {
      name: 'register_contact_request',
      description:
        'Сначала прочитай навык balldecor-order-contact через read_skill, затем сохрани обращение по просьбе посетителя связаться или подтверждению отправки. Возвращает ID и статус saved — обращение сохранено. Повтор с теми же контактами и текстом возвращает то же обращение.',
      parameters: {
        type: 'object',
        properties: {
          reasoning: {
            type: 'string',
            description: 'Кратко сообщи цель регистрации обращения.',
          },
          contacts: {
            type: 'string',
            description:
              'Контакт, предоставленный посетителем, и выбранный им канал связи.',
          },
          message: {
            type: 'string',
            description:
              'Согласованная сводка запроса, включая известные адрес, состав и срок.',
          },
        },
        required: ['reasoning', 'contacts', 'message'],
        additionalProperties: false,
      },
    },
  },
  prepare(args) {
    if (
      typeof args.contacts !== 'string' ||
      !args.contacts.trim() ||
      args.contacts.trim().length > 1000 ||
      typeof args.message !== 'string' ||
      !args.message.trim() ||
      args.message.trim().length > 9000
    ) {
      throw new Error(
        'Укажи контакт до 1000 символов и сводку обращения до 9000 символов',
      )
    }
    const input = {
      contacts: args.contacts.trim(),
      message: args.message.trim(),
    }
    return {
      reasoning: args.reasoning,
      execute: async (context) => {
        if (!context.registerContactRequest) {
          throw new Error(
            'Для регистрации обращения используй форму обратной связи сайта',
          )
        }
        return JSON.stringify(
          await context.registerContactRequest(input, context),
        )
      },
    }
  },
}
