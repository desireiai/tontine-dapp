"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coins, Menu, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Coins className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Tontine<span className="text-primary">5BLOC</span>
          </h1>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Mes Tontines
          </Link>
          <Link 
            href="/tontines" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Explorer
          </Link>
          <Link href="/create">
            <Button variant="outline" size="sm">
              Créer une Tontine
            </Button>
          </Link>
          <ConnectButton 
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ConnectButton 
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              href="/dashboard" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mes Tontines
            </Link>
            <Link 
              href="/tontines" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorer
            </Link>
            <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">
                Créer une Tontine
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
