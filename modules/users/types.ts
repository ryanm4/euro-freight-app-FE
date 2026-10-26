export interface USER_LIST {
  id: number
  full_name: string
  email: string
  is_active: number
  created_at: string
  phone: string
  updated_at: string
  username: string
  groups: GROUP_LIST[]
  roles: ROLE_LIST[]
}

interface GROUP_LIST {
  id: number
  group_name: string
  description: string
}

interface ROLE_LIST {
  id: number
  access_type: string
  description: string
  role_name: string
}
