import type { SubmitEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  useAddConceptProductToCartMutation,
  useRequestConceptRegistrationMutation,
  useRequestConceptPasswordResetMutation,
  useRequestConceptPaymentMutation,
  useRequestConceptCallbackMutation,
  useRequestConceptPrintOrderMutation,
  useRequestConceptQuickOrderMutation,
  useSubmitConceptFeedbackMutation,
} from 'app/gql/generated'
import { useSnackbar } from './useSnackbar'

export function useConceptActions(conceptId: string) {
  const snackbar = useSnackbar()
  const navigate = useNavigate()
  const options = {
    onError: () =>
      snackbar?.addMessage('Не удалось отправить запрос', { variant: 'error' }),
  }
  const [requestCallback] = useRequestConceptCallbackMutation(options)
  const [submitFeedback] = useSubmitConceptFeedbackMutation(options)
  const [printOrder] = useRequestConceptPrintOrderMutation(options)
  const [quickOrder] = useRequestConceptQuickOrderMutation(options)
  const [addProduct] = useAddConceptProductToCartMutation(options)

  const [register] = useRequestConceptRegistrationMutation(options)
  const [resetPassword] = useRequestConceptPasswordResetMutation(options)
  const [requestPayment] = useRequestConceptPaymentMutation(options)

  function onSubmit(event: SubmitEvent<HTMLElement>) {
    const form = event.target
    if (!(form instanceof HTMLFormElement) || form.closest('footer, nav')) {
      return
    }
    if (form.matches('[name="ShopForm"]')) {
      event.preventDefault()
      void requestPayment({ variables: { conceptId } })
      return
    }
    if (form.matches('.loginFPForm')) {
      event.preventDefault()
      void resetPassword({ variables: { conceptId } })
      return
    }
    if (form.elements.namedItem('registerbtn')) {
      event.preventDefault()
      void register({ variables: { conceptId } })
      return
    }
    const data = new FormData(form)
    const field = (key: string) => String(data.get(key) ?? '')
    const action = form.dataset.action || field('pub_action') || field('action')
    const name = field('name')
    switch (action) {
      case 'forms/contacts':
        event.preventDefault()
        void submitFeedback({
          variables: {
            conceptId,
            name,
            contact: field('phone'),
            message: field('message'),
          },
        })
        break
      case 'forms/quick_order':
        event.preventDefault()
        void quickOrder({
          variables: { conceptId, name, contact: field('contact') },
        })
        break
      case 'form/print_order': {
        event.preventDefault()
        const logo = data.get('logofile')
        void printOrder({
          variables: {
            conceptId,
            data: {
              name,
              phone: field('phone'),
              email: field('email'),
              comments: field('comments'),
              colors: data.getAll('print-color[]').map(String),
              printType: field('print-type'),
              amount: field('amount'),
              extras: data.getAll('related[]').map(String),
              logo: logo instanceof File && logo.size ? logo : null,
            },
          },
        })
        break
      }
      case 'forms/callme':
        event.preventDefault()
        void requestCallback({
          variables: { conceptId, name, phone: field('phone') },
        })
        break
      case 'add_product': {
        event.preventDefault()
        const quantity = Number(field('quantity') || 1)
        if (Number.isSafeInteger(quantity) && quantity > 0) {
          void addProduct({
            variables: { conceptId, productId: field('product_id'), quantity },
          })
        }
        break
      }
    }
  }

  function onClickCapture(event: MouseEvent<HTMLElement>) {
    if (
      !(event.target instanceof Element) ||
      event.target.closest('footer, nav')
    ) {
      return
    }
    const trigger = event.target.closest<HTMLElement>('[data-toggle]')

    if (!trigger) {
      return
    }
    const toggle = trigger.dataset.toggle
    if (toggle === 'tab' || toggle === 'collapse') {
      const hash =
        trigger instanceof HTMLAnchorElement ? trigger.hash.slice(1) : ''
      const panel = document.getElementById(hash)
      if (!panel || !event.currentTarget.contains(panel)) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      if (toggle === 'collapse') {
        const expanded = panel.classList.toggle('in')
        trigger.classList.toggle('collapsed', !expanded)
        trigger.setAttribute('aria-expanded', String(expanded))
      } else {
        for (const tab of trigger
          .closest('.nav-tabs')
          ?.querySelectorAll('[role="tab"]') ?? []) {
          tab.parentElement?.classList.toggle('active', tab === trigger)
          tab.setAttribute('aria-selected', String(tab === trigger))
        }
        for (const pane of panel.parentElement?.querySelectorAll(
          ':scope > .tab-pane',
        ) ?? []) {
          pane.classList.toggle('active', pane === panel)
        }
      }
      return
    }

    switch (trigger.getAttribute('data-target')) {
      case '#callback':
        event.preventDefault()
        event.stopPropagation()
        void requestCallback({ variables: { conceptId } })
        break
      case '#LoginModal':
        event.preventDefault()
        event.stopPropagation()
        void navigate('/signin')
        break
    }
  }

  return { onSubmit, onClickCapture }
}
