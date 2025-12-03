"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
  email: {
    subject: string
    body: string
    recipient: string
  }
}

export function EmailDialog({ isOpen, onClose, email }: EmailDialogProps) {
  const { toast } = useToast()

  const handleCopy = () => {
    const fullEmail = `To: ${email.recipient}\nSubject: ${email.subject}\n\n${email.body}`
    navigator.clipboard.writeText(fullEmail)
    toast({
      title: "Email Copied",
      description: "The email content has been copied to your clipboard.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-card">
        <DialogHeader>
          <DialogTitle>Draft Email</DialogTitle>
          <DialogDescription>
            Here is the drafted email. You can copy the content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">To: {email.recipient}</p>
            <p className="text-sm font-medium text-muted-foreground">Subject: {email.subject}</p>
          </div>
          <div className="p-4 border rounded-md bg-background/50 h-64 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{email.body}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
