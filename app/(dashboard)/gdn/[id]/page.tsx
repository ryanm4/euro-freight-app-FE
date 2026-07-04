import { useParams } from "next/navigation"

export default async function GdnByID() {
  const { id } = useParams<{ id: string }>()
  return (
    <div>
      <h1>GDN By ID</h1>
      <p>ID: {id}</p>
    </div>
  )
}
