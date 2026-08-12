"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { useState } from "react"
import PurchaseOrderForm from "../_components/purchase-order-form"
import PurchaseOrderImportUpload from "../_components/purchase-order-import-upload"

export default function PurchaseOrderCreatePage() {
  const [importedData, setImportedData] = useState<any | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)

  console.log("importedData", importedData)
  console.log("sourceFile", sourceFile)

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Purchase Order Creation"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Purchase Order", href: "/purchase-order" },
        ]}
      />

      <div className="mt-4 h-full">
        {importedData ? (
          <PurchaseOrderForm
            initialData={importedData}
            sourceFile={sourceFile}
          />
        ) : (
          <PurchaseOrderImportUpload
            onImported={(data, file) => {
              setImportedData(data)
              setSourceFile(file)
            }}
          />
        )}
      </div>
    </div>
  )
}