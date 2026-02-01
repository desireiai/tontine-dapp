import Link from "next/link";
import { Coins } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-16 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Tontine<span className="text-primary">5BLOC</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Système décentralisé de gestion de tontine africaine avec mécanisme 
              d&apos;avalisation dynamique. Transparence, sécurité et solidarité communautaire.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/create" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Créer une Tontine
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mes Tontines
                </Link>
              </li>
              <li>
                <Link 
                  href="/tontines" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="font-semibold mb-4">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.tontine5bloc.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://sepolia.etherscan.io" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Etherscan
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tontine5BLOC - Projet Web3</p>
        </div>
      </div>
    </footer>
  );
}
