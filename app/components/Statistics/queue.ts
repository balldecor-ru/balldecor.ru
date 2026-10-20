import type {
  DeliveryResult,
  StatisticsPacket,
  StatisticsSender,
} from './transport'

export const MAX_STATISTICS_ATTEMPTS: number = 3
export const MAX_QUEUED_VISITS: number = 100
const RETRY_DELAYS_MS: readonly number[] = [1000, 3000]

interface PendingVisit {
  packet: StatisticsPacket
  attempts: number
  nextAttemptAt: number
}

export interface StatisticsQueue {
  enqueue: (packet: StatisticsPacket) => void
  flush: () => void
  dispose: () => void
}

export const createStatisticsQueue = (
  send: StatisticsSender,
): StatisticsQueue => {
  let pending: PendingVisit[] = []
  let sending: boolean = false
  let stopped: boolean = false
  let timer: ReturnType<typeof setTimeout> | undefined

  const schedule = (): void => {
    if (stopped || sending || timer !== undefined || !pending.length) {
      return
    }
    timer = setTimeout(
      () => {
        timer = undefined
        void deliver()
      },
      Math.max(0, pending[0].nextAttemptAt - Date.now()),
    )
  }

  const deliver = async (): Promise<void> => {
    if (stopped || sending || !pending.length) {
      return
    }
    if (pending[0].nextAttemptAt > Date.now()) {
      schedule()
      return
    }
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    const visit: PendingVisit | undefined = pending.shift()
    if (!visit) {
      return
    }
    sending = true
    visit.attempts += 1
    let result: DeliveryResult
    try {
      result = await send(visit.packet)
    } catch {
      result = 'retry'
    }
    sending = false
    if (stopped) {
      return
    }
    if (result === 'disabled') {
      stopped = true
      pending = []
      return
    }
    if (result === 'retry' && visit.attempts < MAX_STATISTICS_ATTEMPTS) {
      visit.nextAttemptAt = Date.now() + RETRY_DELAYS_MS[visit.attempts - 1]
      pending.unshift(visit)
      pending = pending.slice(0, MAX_QUEUED_VISITS)
    }
    schedule()
  }

  return {
    enqueue: (packet: StatisticsPacket): void => {
      if (stopped || pending.length >= MAX_QUEUED_VISITS) {
        return
      }
      pending.push({ packet, attempts: 0, nextAttemptAt: Date.now() })
      schedule()
    },
    flush: (): void => {
      void deliver()
    },
    dispose: (): void => {
      stopped = true
      pending = []
      if (timer !== undefined) {
        clearTimeout(timer)
        timer = undefined
      }
    },
  }
}
