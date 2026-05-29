import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "./ui/checkbox";

const SKINCARE_CONCERNS = [
  { id: "anti-aging", label: "Anti-Aging", description: "Fine lines, wrinkles, firmness" },
  { id: "acne", label: "Acne & Breakouts", description: "Pimples, blackheads, oily skin" },
  { id: "hydration", label: "Hydration", description: "Dryness, flakiness, moisture barrier" },
  { id: "hyperpigmentation", label: "Hyperpigmentation", description: "Dark spots, uneven tone, sun damage" },
  { id: "sensitivity", label: "Sensitivity", description: "Redness, irritation, rosacea" },
  { id: "texture", label: "Texture & Pores", description: "Large pores, rough texture, scarring" },
] as const;

interface ImageUploadProps {
  onAnalysisComplete: (analysis: any) => void;
}

export const ImageUpload = ({
  onAnalysisComplete
}: ImageUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [age, setAge] = useState<string>("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  const toggleConcern = (concernId: string) => {
    setSelectedConcerns(prev => 
      prev.includes(concernId) 
        ? prev.filter(id => id !== concernId)
        : [...prev, concernId]
    );
  };
  const {
    toast
  } = useToast();
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsAnalyzing(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to base64 for analysis
      const base64 = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Call the analyze-skin edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-skin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          imageData: base64,
          age: age ? parseInt(age) : null,
          concerns: selectedConcerns.length > 0 ? selectedConcerns : null
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      const {
        analysis
      } = await response.json();
      onAnalysisComplete(analysis);
      toast({
        title: "Analysis complete!",
        description: "Your skin analysis is ready."
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  return <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Age Input */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Label htmlFor="age" className="text-lg font-semibold text-foreground">
          Your Age
        </Label>
        <p className="text-sm text-muted-foreground mb-3">Enter your age for personalized, age-appropriate skincare recommendations!</p>
        <Input id="age" type="number" min="18" max="120" value={age} onChange={e => setAge(e.target.value)} className="max-w-32" disabled={isAnalyzing} placeholder="35" />
      </div>

      {/* Skincare Concerns */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Label className="text-lg font-semibold text-foreground">
          Skincare Focus Areas
        </Label>
        <p className="text-sm text-muted-foreground mb-4">Select any specific concerns you'd like us to focus on (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SKINCARE_CONCERNS.map((concern) => (
            <label
              key={concern.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedConcerns.includes(concern.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Checkbox
                checked={selectedConcerns.includes(concern.id)}
                onCheckedChange={() => toggleConcern(concern.id)}
                disabled={isAnalyzing}
              />
              <div className="space-y-0.5">
                <span className="font-medium text-foreground">{concern.label}</span>
                <p className="text-xs text-muted-foreground">{concern.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="relative">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={isAnalyzing} />
        <label htmlFor="image-upload">
          <div className="border-2 border-dashed border-border rounded-2xl p-12 hover:border-primary transition-colors cursor-pointer bg-card">
            {previewImage && !isAnalyzing ? <img src={previewImage} alt="Preview" className="max-w-full max-h-96 mx-auto rounded-xl" /> : <div className="flex flex-col items-center justify-center space-y-4">
                {isAnalyzing ? <>
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    <p className="text-lg text-muted-foreground">Analyzing your skin...</p>
                  </> : <>
                    <Upload className="h-16 w-16 text-primary" />
                    <div className="text-center space-y-2">
                      <p className="text-xl font-semibold text-foreground">
                        Upload Your Photo
                      </p>
                      <p className="text-muted-foreground">
                        Take or upload a clear photo of your face for personalized analysis
                      </p>
                    </div>
                    <div className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      Choose Photo
                    </div>
                  </>}
              </div>}
          </div>
        </label>
      </div>
      
      {previewImage && !isAnalyzing && <Button variant="outline" size="lg" className="w-full" onClick={() => document.getElementById('image-upload')?.click()}>
          Upload New Photo
        </Button>}
    </div>;
};