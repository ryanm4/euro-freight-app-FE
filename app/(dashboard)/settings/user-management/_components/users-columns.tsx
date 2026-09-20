"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { USER_LIST } from "@/modules/users/types"
import {
  IconArrowsSort,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

interface UserTableActions {
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export const userColumns = (
  actions: UserTableActions
): ColumnDef<USER_LIST>[] => {
  return [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.original.created_at
        return (
          <div className="px-3">
            {date ? format(new Date(date), "dd/MMM/yy") : "N/A"}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        const id = String(user.id || user.username)

        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => actions.onView?.(id)}
                  >
                    <IconEye className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <IconPencil className="h-4 w-4 text-zinc-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit not available yet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <IconTrash className="h-4 w-4 text-zinc-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete not available yet</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )
      },
    },
  ]
}
