"use server";

import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

export type EnsProfile = {
  ensName: string;
  address: string | null;
  avatar: string | null;
  twitter: string | null;
  github: string | null;
  email: string | null;
};

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

export async function getEnsProfile(ensName: string): Promise<EnsProfile> {
  const normalizedName = normalize(ensName);

  // Resolve ENS name to address
  const address = await client.getEnsAddress({
    name: normalizedName,
  });

  if (!address) {
    return {
      ensName,
      address: null,
      avatar: null,
      twitter: null,
      github: null,
      email: null,
    };
  }

  // Fetch avatar and text records in parallel
  const [avatar, twitter, github, email] = await Promise.all([
    client.getEnsAvatar({ name: normalizedName }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: "com.twitter" }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: "com.github" }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: "email" }).catch(() => null),
  ]);

  return {
    ensName,
    address,
    avatar,
    twitter,
    github,
    email,
  };
}

