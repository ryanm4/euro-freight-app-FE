export interface USER_LIST {
  id: number | string
  username: string
  email: string
  full_name: string
  phone: string
  role?: string
  group?: string
  status?: string
  created_at?: string
  created_by?: string
  updated_by?: string
}

export interface USER_CREATE_PAYLOAD {
  username: string
  email: string
  password?: string
  full_name: string
  phone: string
  created_by?: string
  updated_by?: string
}
