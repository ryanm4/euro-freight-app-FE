const API_BASE_URL = process.env.BACKEND_URL
const NEXTJS_API_BASE = "/api"
export const API_ENDPOINTS = {
  PACKING_LIST: {
    LIST: `${API_BASE_URL}/api/v1/packing_lists`,
    CREATE: `${API_BASE_URL}/api/v1/packing_lists`,
    GET: (item_id: number | string) =>
      `${API_BASE_URL}/api/v1/packing_lists/${item_id}`,
    UPDATE: (item_id: number | string) =>
      `${API_BASE_URL}/api/v1/packing_lists/${item_id}`,
    DELETE: (item_id: number | string) =>
      `${API_BASE_URL}/api/v1/packing_lists/${item_id}`,
  },

  GDN: {
    LIST: `${API_BASE_URL}/api/v1/goods_dispatch_notes`,
    CREATE: `${API_BASE_URL}/api/v1/goods_dispatch_notes`,
  },

  CLIENTS: {
    LIST: `${API_BASE_URL}/clients`,
  },
  PURCHASE_ORDER: {
    LIST: `${API_BASE_URL}/purchase_orders`,
  },

  RELATIVE: {
    PACKING_LIST: {
      LIST: `${NEXTJS_API_BASE}/packing-list`,
      CREATE: `${NEXTJS_API_BASE}/packing-list`,
      UPDATE: (poId: number | string) =>
        `${NEXTJS_API_BASE}/packing-list/${poId}`,
      GET: (poId: number | string) => `${NEXTJS_API_BASE}/packing-list/${poId}`,
      DELETE: (poId: number | string) =>
        `${NEXTJS_API_BASE}/packing-list/${poId}`,
    },
    CLIENTS: {
      LIST: `${NEXTJS_API_BASE}/clients`,
    },
    PURCHASE_ORDER: {
      LIST: `${NEXTJS_API_BASE}/purchase-orders`,
    },

    GDN: {
      LIST: `${NEXTJS_API_BASE}/goods_delivered_notes`,
      CREATE: `${NEXTJS_API_BASE}/goods_delivered_notes`,
    },
  },
} as const
