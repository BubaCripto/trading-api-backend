
// utils/paginateQuery.js

const buildFilter = (queryFilter = {}) => {
  const parsed = {};
  for (const key in queryFilter) {
    if (typeof queryFilter[key] === 'string' && queryFilter[key].startsWith('regex:')) {
      const value = queryFilter[key].replace('regex:', '');
      parsed[key] = { $regex: value, $options: 'i' };
    } else {
      parsed[key] = queryFilter[key];
    }
  }
  return parsed;
};

async function paginateQuery(model, req, {
  defaultLimit = 10,
  maxLimit = 100,
  populate = null,
  select = null,
  defaultSort = '-createdAt',
  baseFilter = {}
} = {}) {
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const limit = Math.min(parseInt(req.query.limit) || defaultLimit, maxLimit);
  const skip = (page - 1) * limit;
  const sort = req.query.sort || defaultSort;

  const filter = {
    ...baseFilter,
    ...buildFilter(req.query.filter ? JSON.parse(req.query.filter) : {})
  };

  const query = model.find(filter).skip(skip).limit(limit).sort(sort);
  if (populate) query.populate(populate);
  if (select) query.select(select);

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter)
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = paginateQuery;
