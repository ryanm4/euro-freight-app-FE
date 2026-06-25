import apiClient from "@/lib/axios-client"
import { API_ENDPOINTS } from "@/config/api-endpoints"
import { PURCHASE_ORDER } from "./types"

export const PurchaseOrderApi = {
  getAll: () =>
    apiClient.get<PURCHASE_ORDER[]>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDER.LIST),
}
