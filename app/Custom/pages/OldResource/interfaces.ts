import type { NormalizedCacheObject } from '@apollo/client'
import type {
  OldResourceQuery,
  OldResourceQueryVariables,
} from '../../../gql/generated/oldResource'

export interface OldResourcePageData {
  variables: OldResourceQueryVariables
  resource: OldResourceQuery['oldResource']
  initialApolloState: NormalizedCacheObject
}
