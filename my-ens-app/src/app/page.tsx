"use client";

import { useState } from "react";
import { NetworkGraph } from "@/components/NetworkGraph";
import { ProfileCard } from "@/components/ProfileCard";
import { getEnsProfile, type EnsProfile } from "@/app/actions/ens";

export default function Home() {
  const [selectedProfile, setSelectedProfile] = useState<EnsProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const handleNodeClick = async (ensName: string) => {
    setIsLoadingProfile(true);
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
    <div className="flex h-screen w-full bg-zinc-950">
      {/* Left Column - Network Graph */}
      <div className="flex-1 border-r border-zinc-800">
        <NetworkGraph onNodeClick={handleNodeClick} />
      </div>

      {/* Right Column - Profile Card */}
      <div className="flex w-96 flex-col bg-zinc-900">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <p className="text-sm text-zinc-400">Click a node to view details</p>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          {selectedProfile || isLoadingProfile ? (
            <ProfileCard profile={selectedProfile} isLoading={isLoadingProfile} />
          ) : (
            <div className="text-center text-zinc-500">
              <p className="text-sm">No profile selected</p>
              <p className="mt-1 text-xs">Click on a node in the graph</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
