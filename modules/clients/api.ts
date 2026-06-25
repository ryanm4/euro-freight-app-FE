import apiClient from "@/lib/axios-client"
import { API_ENDPOINTS } from "@/config/api-endpoints"
import { CLIENT_LIST } from "./types"

export const ClientApi = {
  getAll: () =>
    apiClient.get<CLIENT_LIST[]>(API_ENDPOINTS.RELATIVE.CLIENTS.LIST),
}
