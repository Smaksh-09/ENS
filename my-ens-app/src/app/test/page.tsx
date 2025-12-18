"use client";

import { useState } from "react";
import { getEnsProfile, type EnsProfile } from "@/app/actions/ens";
import { ProfileCard } from "@/components/ProfileCard";

export default function TestPage() {
  const [ensName, setEnsName] = useState("vitalik.eth");
  const [profile, setProfile] = useState<EnsProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [graphResult, setGraphResult] = useState<string>("");

  const testEnsProfile = async () => {
    setIsLoading(true);
    try {
      const result = await getEnsProfile(ensName);
      setProfile(result);
    } catch (error) {
      console.error(error);
      alert("Error fetching ENS profile");
    }
    setIsLoading(false);
  };

  const testGetGraph = async () => {
    const res = await fetch("/api/graph");
    const data = await res.json();
    setGraphResult(JSON.stringify(data, null, 2));
  };

  const testCreateEdge = async () => {
    const res = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceEns: "vitalik.eth",
        targetEns: "balajis.eth",
      }),
    });
    const data = await res.json();
    setGraphResult(JSON.stringify(data, null, 2));
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="mb-8 text-3xl font-bold">🧪 Test Page</h1>

      {/* ENS Profile Test */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">1. Test ENS Profile</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={ensName}
            onChange={(e) => setEnsName(e.target.value)}
            placeholder="Enter ENS name"
            className="rounded bg-zinc-800 px-4 py-2 text-white"
          />
          <button
            onClick={testEnsProfile}
            className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            Fetch Profile
          </button>
        </div>
        <ProfileCard profile={profile} isLoading={isLoading} />
      </section>

      {/* Graph API Test */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">2. Test Graph API</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={testGetGraph}
            className="rounded bg-green-600 px-4 py-2 hover:bg-green-700"
          >
            GET /api/graph
          </button>
          <button
            onClick={testCreateEdge}
            className="rounded bg-purple-600 px-4 py-2 hover:bg-purple-700"
          >
            POST /api/graph (vitalik ↔ balajis)
          </button>
        </div>
        {graphResult && (
          <pre className="rounded bg-zinc-800 p-4 overflow-auto max-h-96 text-sm">
            {graphResult}
          </pre>
        )}
      </section>
    </div>
  );
}

