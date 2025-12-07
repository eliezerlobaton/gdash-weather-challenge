export type StarWarsCategory = 'characters' | 'creatures' | 'droids' | 'locations' | 'organizations' | 'species' | 'vehicles'

export interface StarWarsEntity {
  _id: string
  name: string
  description: string
  image: string
  __v: number
}

export interface StarWarsSearchResponse {
  info: {
    total: number
    page: number
    limit: number
    next: string | null
    prev: string | null
  }
  data: StarWarsEntity[]
}
