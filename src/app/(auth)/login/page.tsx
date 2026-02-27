"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthContext } from "@/lib/contexts/auth-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RvtLogo } from "@/components/icons";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

    const { signInWithGoogle } = useAuthContext();

    const [mode, setMode] = useState<"login" | "signup" | "reset">(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithGoogle();
            router.push("/"); // Will hit protected layout and show dashboard
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google.");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === "signup") {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                router.push("/");
            } else if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
                router.push("/");
            } else if (mode === "reset") {
                await sendPasswordResetEmail(auth, email);
                setMessage("Password reset email sent. Check your inbox.");
                setMode("login");
            }
        } catch (err: any) {
            // Clean up Firebase error messages for the user
            let errMsg = err.message;
            if (errMsg.includes("auth/invalid-credential")) errMsg = "Invalid email or password.";
            if (errMsg.includes("auth/email-already-in-use")) errMsg = "An account with this email already exists.";
            if (errMsg.includes("auth/weak-password")) errMsg = "Password should be at least 6 characters.";
            setError(errMsg);
        } finally {
            if (mode !== "reset" || error) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md space-y-8 glass-card p-10 border-white/10 relative z-10">

                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="mb-6 p-3 bg-primary/10 rounded-2xl">
                        <RvtLogo className="h-10 w-10 text-primary" />
                    </Link>
                    <h2 className="text-3xl font-headline font-bold mb-2">
                        {mode === "login" ? "Welcome Back" :
                            mode === "signup" ? "Create your Account" : "Reset Password"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {mode === "login" ? "Enter your details to access your dashboard." :
                            mode === "signup" ? "Start managing your freight business today." :
                                "We will send you a link to reset your password."}
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm text-center">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">

                        {mode === "signup" && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="bg-black/20 border-white/10 text-white placeholder:text-muted-foreground h-12"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="bg-black/20 border-white/10 text-white placeholder:text-muted-foreground h-12"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {mode !== "reset" && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    {mode === "login" && (
                                        <button
                                            type="button"
                                            onClick={() => { setError(null); setMode("reset"); }}
                                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    required
                                    className="bg-black/20 border-white/10 text-white placeholder:text-muted-foreground h-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 font-semibold text-base shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                            mode === "login" ? "Sign In" :
                                mode === "signup" ? "Create Account" : "Send Reset Link"}
                    </Button>
                </form>

                {mode !== "reset" && (
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#0c0c0e] px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 glass border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span className="font-medium text-foreground">Google</span>
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center text-sm">
                    {mode === "login" ? (
                        <p className="text-muted-foreground">
                            Don't have an account?{" "}
                            <button onClick={() => { setError(null); setMode("signup"); }} className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Sign up
                            </button>
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <button onClick={() => { setError(null); setMode("login"); }} className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Sign in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
