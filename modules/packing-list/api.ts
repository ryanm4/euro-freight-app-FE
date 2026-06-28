import apiClient from "@/lib/axios-client"
import { API_ENDPOINTS } from "@/config/api-endpoints"
import { CREATE_PACKING_LIST, PACKING_LIST } from "./types"

export const packingListApi = {
  getAll: () =>
    apiClient.get<PACKING_LIST[]>(API_ENDPOINTS.RELATIVE.PACKING_LIST.LIST),
  create: (data: PACKING_LIST) =>
    apiClient.post<CREATE_PACKING_LIST>(
      API_ENDPOINTS.RELATIVE.PACKING_LIST.CREATE,
      data
    ),
}
