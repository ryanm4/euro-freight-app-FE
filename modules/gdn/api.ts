import apiClient from "@/lib/axios-client"
import { API_ENDPOINTS } from "@/config/api-endpoints"
import { GOODS_DELIVER_NOTE } from "./types"

export const gdnListApi = {
  getAll: () =>
    apiClient.get<GOODS_DELIVER_NOTE[]>(API_ENDPOINTS.RELATIVE.GDN.LIST),
  create: (data: GOODS_DELIVER_NOTE) =>
    apiClient.post<GOODS_DELIVER_NOTE>(API_ENDPOINTS.RELATIVE.GDN.CREATE, data),
}
