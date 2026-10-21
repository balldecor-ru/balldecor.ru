import type React from 'react'
import { useLoaderData } from 'react-router'
import { ConceptItem } from '../../../components/ConceptItem'
import type { loadConcept } from './loader.server'

export const ConceptPage: React.FC = () => {
  const { concept } = useLoaderData<typeof loadConcept>()
  return <ConceptItem concept={concept} variant="full" />
}
