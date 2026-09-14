import apiClient from "@/lib/axios-client";
import { LoginFormValues } from "./validation";

export const loginApi = {
  login: async (data: LoginFormValues) => {
    return apiClient.post("/api/auth/login", data);
  },
};
