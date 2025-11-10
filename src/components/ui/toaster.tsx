"use client"

import { useToast } from "@/components/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { BellRing } from "lucide-react"
import { ReactElement } from "react"
import { HiThumbUp } from "react-icons/hi"
import { IoWarning } from "react-icons/io5"
import { MdError } from "react-icons/md"



export function Toaster() {
  const { toasts } = useToast()
  const variantIcons: Record<string, ReactElement> = {
    warning: <IoWarning size={20}/>,
    destructive: <MdError size={20}/>,
    default: <HiThumbUp size={20}/>,
    reminder : <BellRing size={20}/>
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="rounded-3xl p-5">
            <div className="flex gap-2 items-center">
              
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="flex items-center gap-2">{props.variant ? variantIcons[props.variant] : variantIcons['default']}{description}</ToastDescription>
                )}
              </div>
            </div>

            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
