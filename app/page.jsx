import Image from "next/image";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ProjectsSection from "./components/ProjectsSection";
import BlogSection from "./components/BlogSection";
import SkillsSection from "./components/SkillsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <BlogSection />
    </>
  );
}
