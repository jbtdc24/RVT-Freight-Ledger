import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Freight } from "@/lib/types";

type StatusDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    freight: Freight | null;
    onUpdateStatus: (id: string, newStatus: Freight['status'], comment: string) => void;
};

export function StatusDialog({ isOpen, onClose, freight, onUpdateStatus }: StatusDialogProps) {
    const [status, setStatus] = useState<Freight['status']>('Draft');
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (freight) {
            setStatus(freight.status);
            setComment("");
            setError("");
        }
    }, [freight, isOpen]);

    const handleSubmit = () => {
        if (!comment.trim()) {
            setError("Please add a note explaining why you are changing the status.");
            return;
        }

        if (freight) {
            onUpdateStatus(freight.id, status, comment);
            onClose();
        }
    };

    if (!freight) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                    <DialogDescription>
                        Change status for Load #{freight.freightId}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Current Status</span>
                        <Badge variant="outline" className="w-fit">{freight.status}</Badge>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">New Status</label>
                        <Select
                            value={status}
                            onValueChange={(val: Freight['status']) => setStatus(val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="For Pickup">For Pickup</SelectItem>
                                <SelectItem value="In Route">In Route</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Reason / Note <span className="text-destructive">*</span></label>
                        <Textarea
                            placeholder="e.g. Driver arrived at receiver..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className={error ? "border-destructive" : ""}
                        />
                        {error && <span className="text-xs text-destructive">{error}</span>}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Update Status</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
