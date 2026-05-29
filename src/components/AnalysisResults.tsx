import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sparkles, Heart } from "lucide-react";

interface AnalysisResultsProps {
  analysis: {
    overallHealth: string;
    observations: {
      hydration: string;
      texture: string;
      fineLines: string;
      concerns: string;
    };
    recommendations: string[];
    encouragement: string;
  };
}

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs-attention':
      case 'needs attention':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Overall Health Status */}
      <Card className="p-8 bg-gradient-to-br from-accent/20 to-secondary/20 border-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Your Skin Health
            </h2>
            <Badge className={`${getHealthColor(analysis.overallHealth)} text-base px-4 py-2`}>
              {analysis.overallHealth.charAt(0).toUpperCase() + analysis.overallHealth.slice(1).replace('-', ' ')}
            </Badge>
          </div>
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
      </Card>

      {/* Observations */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-primary">Detailed Analysis</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-lg text-primary mb-2">Hydration</h4>
            <p className="text-foreground">{analysis.observations.hydration}</p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-lg text-primary mb-2">Texture & Tone</h4>
            <p className="text-foreground">{analysis.observations.texture}</p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-lg text-primary mb-2">Fine Lines</h4>
            <p className="text-foreground">{analysis.observations.fineLines}</p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-lg text-primary mb-2">Areas of Focus</h4>
            <p className="text-foreground">{analysis.observations.concerns}</p>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-primary">Personalized Recommendations</h3>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <Card key={index} className="p-5 bg-gradient-to-r from-muted/50 to-accent/30 border-l-4 border-primary hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-foreground flex-1">{recommendation}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Encouragement */}
      <Card className="p-8 bg-gradient-to-br from-secondary/30 to-accent/30 border-2 border-primary/20">
        <div className="flex items-start gap-4">
          <Heart className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">A Message for You</h3>
            <p className="text-foreground text-lg leading-relaxed">{analysis.encouragement}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};