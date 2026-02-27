"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gauge, Truck, Warehouse, Calculator, Menu, Users, Trash2, FileText, Building2, Home, ClipboardList, HandCoins, GripVertical, Settings, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RvtLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsModal } from "@/components/settings-modal";

import { useData } from "@/lib/data-context";
import { useAuthContext } from "@/lib/contexts/auth-context";
import { appConfig } from "@/lib/config";
import { Loader2, LogOut } from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const defaultNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/freight-ledger", label: "Freight Ledger", icon: Truck },
  { href: "/assets", label: "Assets", icon: Warehouse },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/business-expenses", label: "Business Expenses", icon: Building2 },
  { href: "/home-management", label: "Home Management", icon: Home },
];

function SortableNavItem({ item, pathname }: { item: any; pathname: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.href });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = item.icon;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 group/item relative">
      {/* drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-4 opacity-0 group-hover/item:opacity-100 p-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-opacity z-10 hidden md:block"
        title="Drag to rearrange"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <Link
        href={item.href}
        className={`flex-1 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 group ${pathname === item.href
          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          }`}
      >
        <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href ? "" : "text-primary/70"}`} />
        <span className="font-medium">{item.label}</span>
        {pathname === item.href && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
        )}
      </Link>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded } = useData();
  const { user, userData, loading, signOut } = useAuthContext();
  const [navItems, setNavItems] = useState(defaultNavItems);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // minimum distance to move before triggering drag, helps avoid accidental drags when clicking links
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user && pathname === "/") {
      router.push("/dashboard");
    }
  }, [user, pathname, router]);

  useEffect(() => {
    if (isLoaded) {
      const savedOrder = localStorage.getItem("rvt_nav_order");
      if (savedOrder) {
        try {
          const order = JSON.parse(savedOrder);
          const sorted = [...defaultNavItems].sort((a, b) => {
            const indexA = order.indexOf(a.href);
            const indexB = order.indexOf(b.href);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setNavItems(sorted);
        } catch (e) {
          console.error("Failed to parsed saved nav order", e);
        }
      }
    }
  }, [isLoaded]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setNavItems((items) => {
        const oldIndex = items.findIndex((i) => i.href === active.id);
        const newIndex = items.findIndex((i) => i.href === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save new order to local storage
        localStorage.setItem("rvt_nav_order", JSON.stringify(newOrder.map(i => i.href)));

        return newOrder;
      });
    }
  };

  // Public routes should render immediately without waiting for context or showing the dashboard spinner
  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  if (!isLoaded || loading) {
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

  // Fallback for unauthorized pages matching dashboard routes
  if (!user) {
    return <>{children}</>;
  }

  const renderNavLinks = () => (
    <nav className="flex flex-col gap-2 px-4 py-4 ml-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={navItems.map(i => i.href)}
          strategy={verticalListSortingStrategy}
        >
          {navItems.map((item) => (
            <SortableNavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </SortableContext>
      </DndContext>
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
          {renderNavLinks()}
          <div className="mx-6 mt-4">
            <Button variant="ghost" className="w-full text-xs text-muted-foreground/60 hover:text-foreground justify-start gap-2 h-10 border border-dashed border-muted/50 hidden">
              {/* Plus icon here if they wanted to add new static tabs, but these are tied to pages so keeping it hidden for now */}
            </Button>
          </div>
        </div>
      </aside>

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

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
                {renderNavLinks()}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div
              className="glass-card !p-2 !pr-4 flex items-center justify-between gap-4 group relative cursor-pointer hover:bg-white/5 transition-colors border-white/5 shadow-sm rounded-full"
              onClick={() => setIsSettingsOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs text-white font-bold shadow-inner">
                  {userData?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-sm font-bold truncate max-w-[120px] text-foreground leading-tight">
                    {userData?.displayName || user.email?.split('@')[0] || "User"}
                  </span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider leading-tight">{userData?.subscriptionTier || "Free"}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-destructive/10 shrink-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  signOut();
                }}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
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

