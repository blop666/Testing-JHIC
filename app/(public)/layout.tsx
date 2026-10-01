import AIChatLoader from "@/components/ui/ai-chat-loader";
import { SiteNavbar } from "@/components/ui/site-navbar";
import { PublicPageTransition } from "@/components/ui/public-page-transition";
import { SiteFooter } from "@/components/sections/site-footer";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNavbar />
      <PublicPageTransition>{children}</PublicPageTransition>
      <SiteFooter />
      <AIChatLoader />
    </>
  );
}
