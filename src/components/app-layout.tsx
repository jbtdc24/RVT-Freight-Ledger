"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Truck, Warehouse, Calculator, Menu, Users, Trash2, FileText, Building2, Home, ClipboardList, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RvtLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

import { useData } from "@/lib/data-context";
import { appConfig } from "@/lib/config";
import { Loader2 } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/freight-ledger", label: "Freight Ledger", icon: Truck },
  { href: "/assets", label: "Assets", icon: Warehouse },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/business-expenses", label: "Business Expenses", icon: Building2 },
  { href: "/home-management", label: "Home Management", icon: Home },
  { href: "/recycle-bin", label: "Recycle Bin", icon: Trash2 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded } = useData();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <RvtLogo className="h-12 w-12 text-primary animate-pulse" />
            <Loader2 className="h-20 w-20 text-primary/20 animate-spin absolute top-1/2 left-1/2 -mt-10 -ml-10" />
          </div>
          <span className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-widest">Loading Ledger...</span>
        </div>
      </div>
    );
  }

  const navLinks = (
    <nav className="grid gap-2 px-4 py-4">
      {navItems.map((item) => {
        const { href, label, icon: Icon } = item;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 group ${pathname === href
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
          >
            <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${pathname === href ? "" : "text-primary/70"}`} />
            <span className="font-medium">{label}</span>
            {pathname === href && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] glass border-r-0">
        <div className="flex h-20 items-center px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <RvtLogo className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-lg font-bold leading-none tracking-tight">RVT</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Accounting</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-auto">
          {navLinks}
        </div>
        <div className="p-6">
          <div className="glass-card !p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
            <div className="flex flex-col">
              <span className="text-xs font-bold">{appConfig.ownerName}</span>
              <span className="text-[10px] text-muted-foreground">{appConfig.accountType}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-16 items-center gap-4 bg-transparent px-6 border-b border-white/5">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden glass border-none">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col glass border-none p-0 w-[280px]">
              <div className="flex h-20 items-center px-8 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2">
                  <RvtLogo className="h-8 w-8 text-primary" />
                  <span className="font-headline text-xl font-bold">RVT</span>
                </Link>
              </div>
              <div className="overflow-auto flex-1">
                {navLinks}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
