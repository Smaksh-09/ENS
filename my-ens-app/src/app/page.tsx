"use client";

import { useState } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { getEnsProfile, type EnsProfile } from "@/app/actions/ens";
import { Search, Network } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [ensName, setEnsName] = useState("");
  const [profile, setProfile] = useState<EnsProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensName.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const result = await getEnsProfile(ensName.trim().toLowerCase());
      setProfile(result);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              ENS Lookup
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Ethereum Name Service Profile Viewer
            </p>
          </div>
          <Link
            href="/network"
            className="glass glow-cyan flex items-center gap-2 rounded-lg border-primary/30 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/20 sm:px-4"
          >
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Network Graph</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-16">
        {/* Hero Section */}
        <div className="mb-8 w-full max-w-2xl text-center sm:mb-12">
          <div className="glow-ethereum mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-primary/30 sm:h-20 sm:w-20">
            <Search className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Discover ENS Profiles
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
            Search for any Ethereum Name Service address to view their profile,
            avatar, and social links
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="glass-strong mb-8 w-full max-w-2xl rounded-2xl border-white/15 p-4 sm:mb-12 sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <input
              type="text"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              placeholder="vitalik.eth"
              className="glass flex-1 rounded-lg border-white/15 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-muted-foreground transition-all focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !ensName.trim()}
              className="glow-cyan flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/20 px-6 py-3 font-semibold text-white transition-all hover:bg-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="w-full max-w-2xl">
          {hasSearched && (
            <div className="flex justify-center">
              <ProfileCard profile={profile} isLoading={isLoading} />
            </div>
          )}

          {!hasSearched && (
            <div className="glass rounded-2xl border-white/10 p-8 text-center sm:p-12">
              <div className="mb-4 text-5xl opacity-30 sm:text-6xl">🔍</div>
              <p className="text-sm font-medium text-muted-foreground sm:text-base">
                Enter an ENS name to get started
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => {
                    setEnsName("vitalik.eth");
                    setTimeout(() => {
                      const form = document.querySelector("form");
                      form?.requestSubmit();
                    }, 100);
                  }}
                  className="glass rounded-full border-white/10 px-4 py-2 text-xs font-mono text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
                >
                  vitalik.eth
                </button>
                <button
                  onClick={() => {
                    setEnsName("nick.eth");
                    setTimeout(() => {
                      const form = document.querySelector("form");
                      form?.requestSubmit();
                    }, 100);
                  }}
                  className="glass rounded-full border-white/10 px-4 py-2 text-xs font-mono text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
                >
                  nick.eth
                </button>
                <button
                  onClick={() => {
                    setEnsName("brantly.eth");
                    setTimeout(() => {
                      const form = document.querySelector("form");
                      form?.requestSubmit();
                    }, 100);
                  }}
                  className="glass rounded-full border-white/10 px-4 py-2 text-xs font-mono text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
                >
                  brantly.eth
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground sm:px-6">
          <p>Built with Next.js, viem, and Ethereum Name Service</p>
        </div>
      </footer>
    </div>
  );
}
