import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Zap, Award } from "lucide-react";
const Index = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const handleReset = () => {
    setAnalysis(null);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-primary">GraceWell</h1>
                <p className="text-sm text-muted-foreground">AI Skincare Analysis</p>
              </div>
            </div>
            {analysis && <Button variant="outline" onClick={handleReset} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                New Analysis
              </Button>}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!analysis && <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
              Confidence at Every Age
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              AI-powered skin analysis for personalized skincare recommendations. 
              Track your skin health journey with empathy and expertise.
            </p>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
              <div className="bg-card p-6 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="bg-accent/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-primary mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced facial feature analysis to track skin changes over time
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="bg-accent/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-primary mb-2">Personalized Care</h3>
                <p className="text-muted-foreground">
                  Tailored recommendations based on your unique skin needs
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="bg-accent/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-primary mb-2">Supportive Guidance</h3>
                <p className="text-muted-foreground">
                  Positive reinforcement to maintain confidence and well-being
                </p>
              </div>
            </div>
          </div>
        </section>}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!analysis ? <ImageUpload onAnalysisComplete={setAnalysis} /> : <AnalysisResults analysis={analysis} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            GraceWell: AI Skincare • Confidence at Every Age
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;