export type Court = {
  courtId: string
  courtName: string
  courtDescription: string

  buildings: {
    addressLine1?: string
    addressLine2?: string
    addressLine3?: string
    addressLine4?: string
    addressLine5?: string
    postcode?: string
    active?: boolean
  }[]
}
