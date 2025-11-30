"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface FormDeleteButtonProps {
    action: (id: string) => Promise<{ error?: string; success?: string }>
    id: string
}

export function FormDeleteButton({ action, id }: FormDeleteButtonProps) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={() => {
                if (confirm("Tem certeza que deseja excluir?")) {
                    startTransition(async () => {
                        const res = await action(id)
                        if (res.error) {
                            toast.error(res.error)
                        } else if (res.success) {
                            toast.success(res.success)
                        }
                    })
                }
            }}
            className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
        >
            <Trash2 size={16} />
        </Button>
    )
}
