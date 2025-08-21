import Hero from "@/components/Hero";
import ToolsGrid from "@/components/ToolsGrid";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ToolsGrid />
    </div>
  );
};

export default Index;
