"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RvtLogo } from "@/components/icons";
import { useAuthContext } from "@/lib/contexts/auth-context";
import { Loader2, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuthContext();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mode = searchParams.get("mode");
  const isSignup = mode === "signup";

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      // The redirect will be handled by the useEffect above
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in. Please try again.");
      setIsSigningIn(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <RvtLogo className="h-10 w-10 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-2xl font-bold tracking-tight">RVT</span>
              <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Accounting</span>
            </div>
          </div>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-headline">
              {isSignup ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSignup 
                ? "Sign up to start managing your freight ledger" 
                : "Sign in to access your freight ledger"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full h-12 relative group"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2 text-[#4285F4]" />
                  <span className="font-medium">
                    {isSignup ? "Sign up with Google" : "Sign in with Google"}
                  </span>
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Secure Authentication
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="#" className="underline hover:text-primary">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-primary">Privacy Policy</a>
            </p>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
                {" "}
                <button
                  onClick={() => {
                    const newMode = isSignup ? "" : "?mode=signup";
                    window.history.replaceState(null, "", `/login${newMode}`);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/")}
          >
            ← Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
