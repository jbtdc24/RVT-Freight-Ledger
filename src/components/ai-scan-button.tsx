"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/lib/contexts/auth-context";

interface AIScanButtonProps {
    onScanComplete: (extractedData: any) => void;
    className?: string;
}

export function AIScanButton({ onScanComplete, className }: AIScanButtonProps) {
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { user } = useAuthContext();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!user) {
            toast({
                title: "Authentication Required",
                description: "You must be logged in to use the AI Scanner.",
                variant: "destructive"
            });
            return;
        }

        if (file.type !== "application/pdf") {
            toast({
                title: "Invalid File Type",
                description: "AI Auto-Scan currently only supports PDF Rate Confirmations.",
                variant: "destructive"
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please upload a PDF smaller than 5MB.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsScanning(true);
            toast({
                title: "Preparing Document",
                description: "Encoding document for AI extraction...",
            });

            // Read file as Base64 string
            const reader = new FileReader();

            const fileBase64 = await new Promise<string>((resolve, reject) => {
                reader.readAsDataURL(file);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
            });

            toast({
                title: "Scanning Document",
                description: "Gemini AI is extracting load details. This may take a few seconds...",
            });

            // Send base64 to our backend to parse
            const response = await fetch("/api/scan-rate-con", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileBase: fileBase64, fileName: file.name }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to scan document");
            }

            if (result.success && result.data) {
                onScanComplete(result.data);
                toast({
                    title: "Scan Successful",
                    description: "Load details have been populated. Please review them before saving.",
                    variant: "default",
                });
            } else {
                throw new Error("Invalid response from scanning service");
            }

        } catch (error: any) {
            console.error("Scanning Error:", error);
            toast({
                title: "AI Scan Failed",
                description: error.message || "An error occurred while scanning the document.",
                variant: "destructive"
            });
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input so same file can be selected again
            }
        }
    };

    return (
        <div className={className}>
            <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isScanning}
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="h-8 bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 border-primary/20 hover:border-primary/40 text-primary transition-all group shadow-[0_0_10px_rgba(var(--primary),0.05)]"
            >
                {isScanning ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning PDF...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-3.5 w-3.5 group-hover:animate-pulse" />
                        AI Auto-Scan PDF
                    </>
                )}
            </Button>
        </div>
    );
}
