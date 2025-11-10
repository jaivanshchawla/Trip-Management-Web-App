import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";



const LogoutModal = () => {
    const [reason, setReason] = useState<string>("");
    const { toast } = useToast()
    const router = useRouter()

    const [loading, setLoading] = useState(false);

    const deleteAccount = async () => {
        if (reason.length < 3) {
            toast({
                description: "Please provide a reason for deleting the account",
                variant: "warning",
            })
            return;
        }
        try {
            setLoading(true)
            const res = await fetch("/api/users", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason,
                }),
            })
            Cookies.remove('auth-token')
            Cookies.remove('role-token')
            router.push("/")
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
        } catch (error) {
            toast({
                description: "Failed to delete account",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            {/* Button to open dialog */}
            <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2 mt-2">
                    Delete Account <Trash2 size={16} />
                </Button>
            </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent className="max-w-md p-6 rounded-lg">
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                    Are you sure you want to delete your account? This action cannot be undone.
                </DialogDescription>

                {/* Reason Input */}
                <textarea
                    value={reason}
                    placeholder="Please let us know the reason..."
                    onChange={(e) => setReason(e.target.value)}
                />

                {/* Buttons */}
                <DialogFooter className="flex justify-end gap-2">
                    <Button disabled={loading} variant="destructive" onClick={deleteAccount}>{loading ? <Loader2 className="text-white animate-spin" /> : 'Delete'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LogoutModal;
