"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Truck, Warehouse, Calculator, Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RvtLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/freight-ledger", label: "Freight Ledger", icon: Truck },
  { href: "/assets", label: "Assets", icon: Warehouse },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/payroll", label: "Payroll", icon: Calculator },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:text-primary ${
            pathname === href ? "bg-muted text-primary" : "text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <RvtLogo className="h-8 w-8 text-primary" />
              <span className="font-headline text-lg">RVT Accounting</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            {navLinks}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="mb-4 flex h-14 items-center border-b px-4">
                 <Link href="/" className="flex items-center gap-2 font-semibold">
                    <RvtLogo className="h-8 w-8 text-primary" />
                    <span className="font-headline text-lg">RVT Accounting</span>
                 </Link>
              </div>
              <div className="overflow-auto">
                {navLinks}
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Header content can go here, e.g. search bar or user menu */}
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
