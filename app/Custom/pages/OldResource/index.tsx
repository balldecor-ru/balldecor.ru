import { useOldResourceQuery } from '../../../gql/generated/oldResource'
import type { OldResourcePageData } from './interfaces'

export const OldResourcePage: React.FC<
  Pick<OldResourcePageData, 'variables'>
> = ({ variables }) => {
  const { data, error } = useOldResourceQuery({ variables })
  if (error) {
    throw error
  }
  const resource = data?.oldResource
  return resource ? (
    <h1 tabIndex={-1}>{resource.pagetitle}</h1>
  ) : (
    <>
      <h1 tabIndex={-1}>Страница не найдена</h1>
      <p>По этому адресу нет документа.</p>
    </>
  )
}
