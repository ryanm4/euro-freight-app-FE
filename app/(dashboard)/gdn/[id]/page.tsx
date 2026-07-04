export default async function GdnByID({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  console.log("GDN By ID Page Params:", id)
  return (
    <div>
      <h1>GDN By ID</h1>
      <p>ID: {id}</p>
    </div>
  )
}
