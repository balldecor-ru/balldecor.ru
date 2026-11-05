import { catalogSkill } from './content/catalog'
import { printingSkill } from './content/printing'
import { deliverySkill } from './content/delivery'
import { eventsSkill } from './content/events'
import { compositionsSkill } from './content/compositions'
import { contactSkill } from './content/contact'
import type { ChatSkill } from './types'

const skills: readonly ChatSkill[] = [
  catalogSkill,
  printingSkill,
  deliverySkill,
  eventsSkill,
  compositionsSkill,
  contactSkill,
]

export const hasSkills: boolean = skills.length > 0

export const skillSummaries: string = skills
  .map(({ id, description }) => `- ${id}: ${description}`)
  .join(`\n`)

export function readSkill(id: string): ChatSkill {
  const skill = skills.find((item) => item.id === id)
  if (!skill) {
    throw new Error(
      `Unknown skill: ${id}. Available skills: ${skills.map((item) => item.id).join(', ')}`,
    )
  }
  return skill
}
