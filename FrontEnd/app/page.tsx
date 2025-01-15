import Image from "next/image";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Flow } from "@/components/page/Flow";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}