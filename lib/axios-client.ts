import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios"

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      "An unexpected error occurred"

    console.error("❌ Response Error:", {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
    })

    return Promise.reject(error)
  }
)

export default apiClient
