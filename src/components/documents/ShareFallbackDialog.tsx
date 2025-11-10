"use client"

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";

interface ShareFallbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  filename: string;
}

const ShareFallbackDialog: React.FC<ShareFallbackDialogProps> = ({
  isOpen,
  onClose,
  documentUrl,
  filename,
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      // Check if Clipboard API is supported
      if (!navigator.clipboard) {
        toast({
          description: "Copy not supported on this browser",
          variant: "destructive",
        });
        return;
      }

      await navigator.clipboard.writeText(documentUrl);
      toast({
        description: "Copied to clipboard ✅",
      });
      onClose();
    } catch (error) {
      console.error('Fallback dialog copy error:', error);
      toast({
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Copy the link below to share {filename}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Input
            value={documentUrl}
            readOnly
            className="w-full"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy size={16} />
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareFallbackDialog;
