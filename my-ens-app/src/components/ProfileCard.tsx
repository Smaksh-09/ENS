"use client";

import Image from "next/image";
import { Twitter, Github, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { EnsProfile } from "@/app/actions/ens";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileCardProps = {
  profile: EnsProfile | null;
  isLoading?: boolean;
};

function ProfileCardSkeleton() {
  return (
    <Card className="glass w-full max-w-md border-white/10">
      <CardHeader className="items-center">
        <Skeleton className="h-24 w-24 rounded-full bg-white/10" />
        <Skeleton className="mt-4 h-6 w-40 bg-white/10" />
        <Skeleton className="mt-2 h-4 w-64 bg-white/10" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 bg-white/10" />
          <Skeleton className="h-4 w-32 bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 bg-white/10" />
          <Skeleton className="h-4 w-28 bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 bg-white/10" />
          <Skeleton className="h-4 w-36 bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileCard({ profile, isLoading }: ProfileCardProps) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (!profile || !profile.address) {
    return (
      <Card className="glass w-full max-w-md border-white/10">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">ENS name not found</p>
        </CardContent>
      </Card>
    );
  }

  const copyAddress = async () => {
    if (profile.address) {
      await navigator.clipboard.writeText(profile.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`;

  return (
    <Card className="glass w-full max-w-md border-white/10">
      <CardHeader className="items-center text-center">
        {profile.avatar ? (
          <div className="glow-cyan relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-primary/30 sm:h-24 sm:w-24">
            <Image
              src={profile.avatar}
              alt={`${profile.ensName} avatar`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="glow-ethereum flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold text-white ring-2 ring-primary/30 sm:h-24 sm:w-24 sm:text-3xl">
            {profile.ensName.charAt(0).toUpperCase()}
          </div>
        )}
        <CardTitle className="mt-4 text-lg tracking-tight sm:text-xl">
          {profile.ensName}
        </CardTitle>
        <CardDescription>
          <button
            onClick={copyAddress}
            className="inline-flex items-center gap-1.5 font-mono text-xs transition-colors hover:text-primary"
          >
            {truncatedAddress}
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {profile.twitter && (
          <a
            href={`https://twitter.com/${profile.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass flex items-center gap-3 rounded-lg border-white/10 p-3 transition-all hover:bg-white/10 hover:glow-cyan"
          >
            <Twitter className="h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
            <span className="truncate text-sm text-muted-foreground">
              @{profile.twitter}
            </span>
          </a>
        )}

        {profile.github && (
          <a
            href={`https://github.com/${profile.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass flex items-center gap-3 rounded-lg border-white/10 p-3 transition-all hover:bg-white/10 hover:glow-cyan"
          >
            <Github className="h-4 w-4 flex-shrink-0 text-white sm:h-5 sm:w-5" />
            <span className="truncate text-sm text-muted-foreground">
              {profile.github}
            </span>
          </a>
        )}

        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="glass flex items-center gap-3 rounded-lg border-white/10 p-3 transition-all hover:bg-white/10 hover:glow-cyan"
          >
            <Mail className="h-4 w-4 flex-shrink-0 text-secondary sm:h-5 sm:w-5" />
            <span className="truncate text-sm text-muted-foreground">
              {profile.email}
            </span>
          </a>
        )}

        {!profile.twitter && !profile.github && !profile.email && (
          <p className="py-4 text-center text-sm text-muted-foreground opacity-70">
            No social links available
          </p>
        )}
      </CardContent>
    </Card>
  );
}

