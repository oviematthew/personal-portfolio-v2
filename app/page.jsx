import HeroSection from "./components/HeroSection";
import WorkSection from "./components/WorkSection";
import AboutSection from "./components/AboutSection";
import SkillsSection from "./components/SkillsSection";
import WritingSection from "./components/WritingSection";
import ContactSection from "./components/ContactSection";
import RefTracker from "./components/RefTracker";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WorkSection />
      <AboutSection />
      <SkillsSection />
      <WritingSection />
      <ContactSection />
      <RefTracker />
    </>
  );
}
