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
    <Card className="w-full max-w-md">
      <CardHeader className="items-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="mt-4 h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-36" />
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
      <Card className="w-full max-w-md">
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
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        {profile.avatar ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-border">
            <Image
              src={profile.avatar}
              alt={`${profile.ensName} avatar`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-3xl font-bold text-white">
            {profile.ensName.charAt(0).toUpperCase()}
          </div>
        )}
        <CardTitle className="mt-4 text-xl">{profile.ensName}</CardTitle>
        <CardDescription>
          <button
            onClick={copyAddress}
            className="inline-flex items-center gap-1.5 font-mono text-sm transition-colors hover:text-foreground"
          >
            {truncatedAddress}
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {profile.twitter && (
          <a
            href={`https://twitter.com/${profile.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
            <span className="text-sm">@{profile.twitter}</span>
          </a>
        )}

        {profile.github && (
          <a
            href={`https://github.com/${profile.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <Github className="h-5 w-5" />
            <span className="text-sm">{profile.github}</span>
          </a>
        )}

        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <Mail className="h-5 w-5 text-rose-500" />
            <span className="text-sm">{profile.email}</span>
          </a>
        )}

        {!profile.twitter && !profile.github && !profile.email && (
          <p className="text-center text-sm text-muted-foreground">
            No social links available
          </p>
        )}
      </CardContent>
    </Card>
  );
}

