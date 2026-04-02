import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { Tracks } from "@/components/landing/tracks";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { Sponsors } from "@/components/landing/sponsors";
import { RegistrationInfo } from "@/components/landing/RegistrationInfo";
import { SponsorCTA } from "@/components/landing/SponsorCTA";
import { PastWinners } from "@/components/landing/PastWinners";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { CommunityButton } from "@/components/landing/CommunityButton";
import { DeadlineBanner } from "@/components/landing/DeadlineBanner";

export default function Home() {
  return (
    <>
      <DeadlineBanner />
      <Header />
      <CommunityButton />
      <main className="noise-bg">
        <Hero />
        <About />
        <Sponsors />
        <SponsorCTA />
        <RegistrationInfo />
        <Tracks />
        <Prizes />
        <Schedule />
        <PastWinners />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
