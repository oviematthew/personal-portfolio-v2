import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import WorkSection from "./components/WorkSection";
import SkillsSection from "./components/SkillsSection";
import WritingSection from "./components/WritingSection";
import ContactSection from "./components/ContactSection";
import RefTracker from "./components/RefTracker";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <SkillsSection />
      <WritingSection />
      <ContactSection />
      <RefTracker />
    </>
  );
}
