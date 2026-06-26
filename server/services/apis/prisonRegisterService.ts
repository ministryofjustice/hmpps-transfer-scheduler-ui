import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { Prison } from './model/prison'
import CacheInterface from '../../data/cache/cacheInterface'
import { CodedDescription } from '../../@types/journeys'

export default class PrisonRegisterService {
  private apiClient: CustomRestClient

  private cache: CacheInterface<CodedDescription[]>

  private readonly CACHE_TIMEOUT = Number(process.env['PRISON_REGISTER_CACHE_TIMEOUT'] ?? 60)

  constructor(
    authenticationClient: AuthenticationClient,
    cacheStore: (prefix: string) => CacheInterface<CodedDescription[]>,
  ) {
    this.apiClient = new CustomRestClient(
      'Prison Register API',
      config.apis.prisonRegisterApi,
      logger,
      authenticationClient,
      false,
      (retry?: boolean) => (err: Error, res: SuperAgentResponse) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
    this.cache = cacheStore('prison-register')
  }

  async getPrisons(context: ApiRequestContext): Promise<CodedDescription[] | null> {
    const cacheKey = 'prisons'
    const cached = await this.cache.get(cacheKey)
    if (cached) return cached

    try {
      const prisons = (await this.apiClient.withContext(context).get<Prison[]>({ path: `/prisons` })).map(
        ({ prisonId, prisonName }) => ({
          code: prisonId,
          description: prisonName,
        }),
      )

      await this.cache.set(cacheKey, prisons, this.CACHE_TIMEOUT)
      return prisons
    } catch {
      return null
    }
  }
}
