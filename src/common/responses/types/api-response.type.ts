type APIResponseValue = any[] | Record<string, any>;

export type APIResponse<T extends string[] | string, R = APIResponseValue> = {
  [K in T extends string ? T : T[number]]: R;
};

export type APIResponseOnlyMessage = APIResponse<'message', string>;

export type Pagination = {
  metadata: {
    pagination: {
      page: number;
      per_page: number;
      total_pages: number;
      total_items: number;
    };
  };
};

export type PaginatedAPIResponse<R = APIResponseValue> = APIResponse<'data', R[]> & Pagination;
