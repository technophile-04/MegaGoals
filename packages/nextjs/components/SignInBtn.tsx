"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuthSession } from "~~/hooks/useAuthSession";

export const SignInBtn = () => {
  const { openConnectModal } = useConnectModal();
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  return (
    <button className="btn btn-primary" onClick={openConnectModal}>
      Sign in with Ethereum
    </button>
  );
};
