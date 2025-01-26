import { FindManyOptions, Repository } from 'typeorm';

import { PaginatedAPIResponse } from '../../common/responses/types/api-response.type';

declare module 'typeorm' {
  interface Repository<Entity> {
    listWithPagination(options: FindManyOptions<Entity>): Promise<PaginatedAPIResponse<Entity>>;
  }
}

Repository.prototype.listWithPagination = async function (options): Promise<PaginatedAPIResponse<any>> {
  const [data, total] = await this.findAndCount(options);

  const per_page = options.take || data.length;

  return {
    metadata: {
      pagination: {
        page: options.skip ? Math.floor(options.skip / per_page) + 1 : 1,
        per_page,
        total_items: total,
        total_pages: Math.ceil(total / per_page) || 0,
      },
    },
    data,
  };
};
