"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useData } from "@/lib/data-context";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "👋 Hi! I'm your RVT AI Assistant. I can help you:\n\n• Analyze freight loads, revenue & expenses\n• Answer questions about drivers and assets\n• Provide TAX guidance (deductions, quarterly payments, IFTA)\n• Calculate profits, cost-per-mile, and margins\n• Give business insights and recommendations\n\nWhat would you like to know? You can ask about taxes too!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get account data for context
    const { freight, drivers, assets, expenses, homeTransactions } = useData();

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        
        // Add user message
        setMessages(prev => [...prev, {
            role: "user",
            content: userMessage,
            timestamp: new Date()
        }]);

        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: userMessage }
                    ],
                    context: { freight, drivers, assets, expenses, homeTransactions }
                })
            });

            const data = await response.json();

            if (response.ok && data.reply) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: data.reply,
                    timestamp: new Date()
                }]);
            } else {
                const errorMsg = data.error || "Unknown error";
                console.error("Chat API error:", errorMsg);
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: `❌ Error: ${errorMsg}`,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "❌ Network error. Please check your connection and try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestedQuestions = [
        "What's my total revenue?",
        "What business expenses can I deduct?",
        "How do I calculate quarterly taxes?",
        "What's my cost per mile?",
        "Which loads are most profitable?",
        "Tax deductions for truck drivers?"
    ];

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-gradient-to-r from-primary to-primary/80"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[380px] h-[500px] bg-background border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-semibold">RVT AI Assistant</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-primary/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-2",
                                        message.role === "user" ? "flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                        message.role === "assistant" 
                                            ? "bg-primary text-primary-foreground" 
                                            : "bg-muted"
                                    )}>
                                        {message.role === "assistant" ? (
                                            <Bot className="h-4 w-4" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
                                        message.role === "assistant"
                                            ? "bg-muted rounded-tl-none"
                                            : "bg-primary text-primary-foreground rounded-tr-none"
                                    )}>
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggested Questions (only show if few messages) */}
                        {messages.length <= 2 && !isLoading && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInput(q);
                                                inputRef.current?.focus();
                                            }}
                                            className="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-full transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-3 border-t bg-muted/50">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-background"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
