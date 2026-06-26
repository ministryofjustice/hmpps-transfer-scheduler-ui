import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { dataAccess } from '../data'
import AuditService from './auditService'
import PrisonApiService from './apis/prisonApiService'
import logger from '../../logger'
import PrisonerSearchApiService from './apis/prisonerSearchService'
import config from '../config'
import { createRedisClient } from '../data/redisClient'
import CacheInterface from '../data/cache/cacheInterface'
import InMemoryCache from '../data/cache/inMemoryCache'
import RedisCache from '../data/cache/redisCache'
import { populatePrisonerDetails } from '../middleware/populatePrisonerDetails'
import PrisonRegisterService from './apis/prisonRegisterService'
import TransferSchedulerService from './apis/transferSchedulerService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient } = dataAccess()
  const redisClient = config.redis.enabled ? createRedisClient() : null

  const cacheStore = <T>(prefix: string): CacheInterface<T> =>
    redisClient ? new RedisCache<T>(redisClient, prefix) : new InMemoryCache<T>(prefix)

  const prisonPermissionsService = PermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient: hmppsAuthClient,
    logger,
  })

  const prisonerSearchService = new PrisonerSearchApiService(hmppsAuthClient, prisonPermissionsService)

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    prisonApiService: new PrisonApiService(hmppsAuthClient),
    prisonRegisterService: new PrisonRegisterService(hmppsAuthClient, cacheStore),
    transferSchedulerService: new TransferSchedulerService(hmppsAuthClient),
    prisonerSearchService,
    cacheStore,
    populatePrisonerMiddleware: populatePrisonerDetails(prisonPermissionsService),
  }
}

export type Services = ReturnType<typeof services>
