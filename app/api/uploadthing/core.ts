import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

const f = createUploadthing()

const auth = (req: Request) => ({ id: "fakeId" })

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req)

      if (!user) {
        throw new UploadThingError("Unauthorized")
      }

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("file url", file.ufsUrl)

      return {
        uploadedBy: metadata.userId,
      }
    }),

  purchaseOrderUploader: f({
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },

    "application/vnd.ms-excel": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req)

      if (!user) {
        throw new UploadThingError("Unauthorized")
      }

      return {
        userId: user.id,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Purchase order uploaded for userId:", metadata.userId)

      console.log("File name:", file.name)
      console.log("File URL:", file.ufsUrl)
      console.log("File key:", file.key)

      return {
        uploadedBy: metadata.userId,
        fileUrl: file.ufsUrl,
        fileKey: file.key,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
