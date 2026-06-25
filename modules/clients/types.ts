export interface CLIENT_LIST {
  id: number
  name: string
  address: string
  contact_no: string
  contact_person: string
  status: "active" | "inactive"
  type: string
  created_by: string
}
