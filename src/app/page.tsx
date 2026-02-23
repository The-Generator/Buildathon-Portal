import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { Tracks } from "@/components/landing/tracks";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { Sponsors } from "@/components/landing/sponsors";
import { JudgingRubric } from "@/components/landing/JudgingRubric";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { CommunityButton } from "@/components/landing/CommunityButton";

export default function Home() {
  return (
    <>
      <Header />
      <CommunityButton />
      <main>
        <Hero />
        <About />
        <Tracks />
        <Prizes />
        <Schedule />
        <Sponsors />
        <JudgingRubric />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
