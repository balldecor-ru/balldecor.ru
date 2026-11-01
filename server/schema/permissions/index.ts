import type { Context } from 'server/schema/builder'
import { isSudo } from './rules/isSudo'
import { isAuthenticated } from './rules/isAuthenticated'
import { isActive } from './rules/isActive'
import { hasChatToken, type ChatAccessArgs } from './rules/hasChatToken'

export interface AuthScopes {
  sudo: boolean
  authenticated: boolean
  active: boolean
  chatToken: ChatAccessArgs
}

interface ScopeLoaders {
  sudo: boolean
  authenticated: boolean
  active: boolean
  chatToken: (args: ChatAccessArgs) => Promise<boolean>
}

export function authScopes(ctx: Context): ScopeLoaders {
  return {
    sudo: isSudo(ctx),
    active: isActive(ctx),
    authenticated: isAuthenticated(ctx),
    chatToken: (args) => hasChatToken(args, ctx),
  }
}
