export type ListPaginatedResult<T> = {
  data: T[]
  pagination: {
    nextOffset: number
    limit: number
    totalItems: number
    hasNext: boolean
  }
}

export type PagePaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};
