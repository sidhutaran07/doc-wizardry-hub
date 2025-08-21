import { Button } from "@/components/ui/button";
import { FileText, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-20" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          PDF Tools
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-glow/80">
            Made Simple
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Transform, compress, merge, and convert your PDFs with professional-grade tools. 
          Fast, secure, and completely free.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button variant="hero" size="lg" className="min-w-[200px]">
            <FileText className="w-5 h-5" />
            Try Tools Now
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20"
            asChild
          >
            <Link to="/pdf-editor">
              <FileText className="w-5 h-5" />
              PDF Editor
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-glow" />
            <span>Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-glow" />
            <span>100% Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-glow" />
            <span>No Registration</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;