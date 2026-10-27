import { components } from '../../../@types/transferSchedulerApi'

export type Clash = components['schemas']['ClashResponse']['data'][0]['clashes'][0] & { type: string }
