import { UseSessionOptions, useSession } from "next-auth/react";

export const useAuthSession = <R extends boolean>(options?: UseSessionOptions<R>) => {
  const sessionData = useSession(options);

  const address = sessionData?.data?.user?.address;
  const isAuthenticated = sessionData.status === "authenticated";

  return { ...sessionData, address, isAuthenticated };
};
