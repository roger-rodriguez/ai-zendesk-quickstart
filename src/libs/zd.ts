const ZENDESK_SUB_DOMAIN = process.env.ZENDESK_SUB_DOMAIN;
const ZENDESK_API_KEY = process.env.ZENDESK_API_KEY;

type SearchTicketsByGroupInput = {
  group: string;
  updated?: string;
  created?: string;
  solved?: string;
  tags?: string[];
};

export const getTicketComments = async (id: number) => {
  const zd = `https://${ZENDESK_SUB_DOMAIN}.zendesk.com/api/v2/tickets/${id}/comments`;
  const response = await fetch(zd, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${ZENDESK_API_KEY}`,
    },
  });
  const { comments, next_page, previous_page, count } = await response.json();
  console.dir(
    {
      getTicketComments: id,
      rate_limit: response.headers.get("x-rate-limit"),
      rate_limit_remaining: response.headers.get("x-rate-limit-remaining"),
    },
    { depth: null }
  );
  return { comments, next_page, previous_page, count };
};

export const getTicket = async (id: number) => {
  const zd = `https://${ZENDESK_SUB_DOMAIN}.zendesk.com/api/v2/tickets/${id}`;
  const response = await fetch(zd, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${ZENDESK_API_KEY}`,
    },
  });
  const { ticket } = await response.json();
  console.dir(
    {
      getTicket: id,
      rate_limit: response.headers.get("x-rate-limit"),
      rate_limit_remaining: response.headers.get("x-rate-limit-remaining"),
    },
    { depth: null }
  );
  return { ticket };
};

export const searchTicketsByGroup = async ({
  group,
  updated,
  created,
  solved,
  tags = [],
}: SearchTicketsByGroupInput) => {
  let searchCriteria = [
    `group:${group.replaceAll(" ", "+")}`,
    `status:closed`,
    `status:solved`,
    `-tags:pr`,
  ];

  if (updated) {
    searchCriteria.push(updated);
  }

  if (solved) {
    searchCriteria.push(solved);
  }

  if (created) {
    searchCriteria.push(created);
  }

  if (tags.length) {
    tags.forEach((tag: string) => {
      searchCriteria.push(tag);
    });
  }

  const searchEndpoint = `https://${ZENDESK_SUB_DOMAIN}.zendesk.com/api/v2/search?query=${encodeURIComponent(
    searchCriteria.join(" ")
  )}&sort_by=created_at&sort_order:asc&per_page=100`;

  console.log(searchCriteria);

  const fetchAllResults = async (url: string) => {
    let allResults: any[] = [];
    let nextPageUrl = url;
    do {
      const response = await fetch(nextPageUrl, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${ZENDESK_API_KEY}`,
        },
      });
      const json = await response.json();
      const { results, next_page, count, ...rest } = json;
      console.dir(
        {
          rate_limit: response.headers.get("x-rate-limit"),
          rate_limit_remaining: response.headers.get("x-rate-limit-remaining"),
          retry_after: response.headers.get("Retry-After"),
          // headers: response.headers,
          results_in_page: results?.length,
          count: count,
          next_page,
          rest,
        },
        { depth: null }
      );

      if (rest?.error) {
        console.log({
          error: rest.error,
          description: rest.description,
        });
      }

      allResults = allResults.concat(results);
      nextPageUrl = next_page;
    } while (nextPageUrl);

    return allResults;
  };

  const results = await fetchAllResults(searchEndpoint);

  console.log({
    total_results: results.length,
  });
  return { results };
};
