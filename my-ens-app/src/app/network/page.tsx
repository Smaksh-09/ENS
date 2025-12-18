"use client";

import { useState } from "react";
import { NetworkGraph } from "@/components/NetworkGraph";
import { ProfileCard } from "@/components/ProfileCard";
import { getEnsProfile, type EnsProfile } from "@/app/actions/ens";
import { Home, Menu, X } from "lucide-react";
import Link from "next/link";

export default function NetworkPage() {
  const [selectedProfile, setSelectedProfile] = useState<EnsProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  // Start with sidebar closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNodeClick = async (ensName: string) => {
    setIsLoadingProfile(true);
    // Auto-open sidebar on mobile when node is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(true);
    }
    try {
      const profile = await getEnsProfile(ensName);
      setSelectedProfile(profile);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="glass-strong z-50 border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="glass rounded-lg border-white/10 p-2 transition-all hover:bg-white/10 md:hidden"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                ENS Network Graph
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Visualize connections between ENS addresses
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="glass flex items-center gap-2 rounded-lg border-white/10 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Graph Area */}
        <div className="flex-1 md:flex md:flex-1">
          <NetworkGraph onNodeClick={handleNodeClick} />
        </div>

        {/* Profile Sidebar - Responsive */}
        <aside
          className={`
            glass-strong fixed right-0 top-0 z-40 h-full w-full border-l border-white/10 
            transition-transform duration-300 ease-in-out
            sm:w-96 md:sticky md:w-96 md:translate-x-0 lg:w-[420px]
            ${isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                Profile
              </h2>
              <p className="text-xs text-muted-foreground">
                Click a node to view details
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="glass rounded-lg border-white/10 p-2 transition-all hover:bg-white/10 md:hidden"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="flex h-[calc(100vh-56px-65px)] items-center justify-center overflow-y-auto p-4 sm:h-[calc(100vh-64px-73px)] sm:p-6 md:h-[calc(100%-73px)]">
            {selectedProfile || isLoadingProfile ? (
              <ProfileCard
                profile={selectedProfile}
                isLoading={isLoadingProfile}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="mb-4 text-4xl opacity-50">◯</div>
                <p className="text-sm font-medium">No profile selected</p>
                <p className="mt-1 text-xs opacity-70">
                  Click on a node in the graph
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

