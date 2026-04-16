export type PaginatedResult<T> = {
  data: T[]
  pagination: {
    nextOffset: number
    limit: number
    totalItems: number
    hasNext: boolean
  }
}
