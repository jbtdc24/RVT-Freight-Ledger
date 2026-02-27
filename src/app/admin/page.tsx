"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useAuthContext, UserData } from "@/lib/contexts/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, UserCog, UserX, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminUser extends UserData {
    status?: "active" | "suspended";
}

export default function AdminDashboard() {
    const { user, userData, loading: authLoading } = useAuthContext();
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && userData?.role !== 'admin') {
            router.push('/');
        }
    }, [userData, authLoading, router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData: AdminUser[] = [];
            querySnapshot.forEach((doc) => {
                usersData.push(doc.data() as AdminUser);
            });
            setUsers(usersData.sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: "Failed to fetch users. Ensure you have admin permissions.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.role === 'admin') {
            fetchUsers();
        } else if (!authLoading) {
            // Prevent infinite loading if not an admin
            setLoading(false);
        }
    }, [userData, authLoading]);

    const handleUpdateTier = async (userId: string, newTier: string) => {
        try {
            await updateDoc(doc(db, "users", userId), { subscriptionTier: newTier });
            setUsers(prev => prev.map(u => u.uid === userId ? { ...u, subscriptionTier: newTier as any } : u));
            toast({ title: "Success", description: "User subscription updated." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update user tier.", variant: "destructive" });
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus?: string) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        try {
            await updateDoc(doc(db, "users", userId), { status: newStatus });
            setUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
            toast({ title: "Success", description: `User account ${newStatus}.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (userData?.role !== 'admin') {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center gap-4 text-center">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view the Admin Dashboard.</p>
                <Button onClick={() => router.push('/')}>Return Home</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Admin Dashboard">
                <Button variant="outline" onClick={fetchUsers}>Refresh Data</Button>
            </PageHeader>

            <Card className="glass-card">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Subscription Tier</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.uid}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{u.displayName || "Unknown User"}</span>
                                            <span className="text-xs text-muted-foreground">{u.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'admin' ? "default" : "secondary"} className="uppercase text-[10px] tracking-widest font-black">
                                            {u.role || "user"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                        {format(new Date(u.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={u.subscriptionTier || "Free"}
                                            onValueChange={(val) => handleUpdateTier(u.uid, val)}
                                            disabled={u.role === 'admin'}
                                        >
                                            <SelectTrigger className="w-[120px] h-8 text-xs font-bold uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Free">FREE</SelectItem>
                                                <SelectItem value="Pro">PRO</SelectItem>
                                                <SelectItem value="Fleet">FLEET</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.status === 'suspended' ? "destructive" : "outline"} className="uppercase text-[10px] font-black">
                                            {u.status === 'suspended' ? 'Suspended' : 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {u.role !== 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 px-2 tracking-widest text-[10px] font-bold uppercase ${u.status === 'suspended' ? 'text-success hover:text-success hover:bg-success/20' : 'text-destructive hover:text-destructive hover:bg-destructive/20'}`}
                                                onClick={() => handleToggleStatus(u.uid, u.status)}
                                            >
                                                {u.status === 'suspended' ? (
                                                    <><UserCheck className="mr-1 h-3 w-3" /> Reactivate</>
                                                ) : (
                                                    <><UserX className="mr-1 h-3 w-3" /> Suspend</>
                                                )}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
