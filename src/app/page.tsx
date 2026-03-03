import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { Tracks } from "@/components/landing/tracks";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { Sponsors } from "@/components/landing/sponsors";
import { RegistrationInfo } from "@/components/landing/RegistrationInfo";
import { PhotoGallery } from "@/components/landing/PhotoGallery";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { CommunityButton } from "@/components/landing/CommunityButton";

export default function Home() {
  return (
    <>
      <Header />
      <CommunityButton />
      <main className="noise-bg">
        <Hero />
        <About />
        {/* Promo video — relocated from hero */}
        <div className="py-16 sm:py-20" style={{ background: "#0a1a14" }}>
          <div className="mx-auto max-w-3xl px-6">
            <div className="overflow-hidden rounded-xl border border-white/8">
              <video
                className="aspect-video w-full bg-black"
                controls
                preload="metadata"
              >
                <source src="/buildathon-promo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
        <RegistrationInfo />
        <Tracks />
        <Prizes />
        <Schedule />
        <Sponsors />
        <PhotoGallery />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
