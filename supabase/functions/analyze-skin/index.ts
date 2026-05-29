import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, age, concerns } = await req.json();
    console.log("Received analysis request with age:", age, "concerns:", concerns);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting skin analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert dermatologist AI assistant for GraceWell, analyzing skin health with empathy and professionalism. 
            
            ${age ? `The user is ${age} years old. Tailor your analysis and recommendations to be appropriate for their age group, considering typical skin concerns and needs for someone in their ${age < 30 ? 'twenties' : age < 40 ? 'thirties' : age < 50 ? 'forties' : age < 60 ? 'fifties' : 'sixties and beyond'}.` : 'Age was not provided, so give general skincare advice.'}
            
            ${concerns && concerns.length > 0 ? `
            IMPORTANT: The user has specifically requested focus on these skincare areas: ${concerns.join(', ')}.
            Prioritize your analysis and recommendations around these concerns. Provide targeted, specific advice for each selected area.
            
            Concern-specific guidance:
            ${concerns.includes('anti-aging') ? '- Anti-Aging: Focus on collagen support, retinoids, peptides, sun protection, and firming treatments.' : ''}
            ${concerns.includes('acne') ? '- Acne: Focus on salicylic acid, benzoyl peroxide, niacinamide, non-comedogenic products, and sebum control.' : ''}
            ${concerns.includes('hydration') ? '- Hydration: Focus on hyaluronic acid, ceramides, moisture barrier repair, and occlusive products.' : ''}
            ${concerns.includes('hyperpigmentation') ? '- Hyperpigmentation: Focus on vitamin C, arbutin, tranexamic acid, AHAs, and strict sun protection.' : ''}
            ${concerns.includes('sensitivity') ? '- Sensitivity: Focus on soothing ingredients like centella, gentle formulations, fragrance-free products, and barrier support.' : ''}
            ${concerns.includes('texture') ? '- Texture & Pores: Focus on exfoliation (AHAs/BHAs), retinoids, niacinamide, and pore-minimizing treatments.' : ''}
            ` : 'The user did not specify particular concerns, so provide a comprehensive general skin health analysis.'}
            
            Analyze the uploaded facial image and provide:
            1. Overall skin health assessment (good/fair/needs attention)
            2. Specific observations about:
               - Hydration levels
               - Texture and tone
               - Fine lines and wrinkles (consider age-appropriate expectations)
               - Any visible concerns (dryness, pigmentation, etc.)
            3. 3-5 personalized, ACTIONABLE skincare recommendations tailored to their age and selected concerns
            4. Positive, encouraging feedback that celebrates their skin at their current age
            
            IMPORTANT: Even for healthy skin, provide SPECIFIC actionable steps to:
            - Maintain and protect their current skin health
            - Prevent future concerns appropriate to their age
            - Optimize their routine with specific product types, ingredients, or habits
            - Enhance what's already working (e.g., "Your hydration is great - boost it further with...")
            
            Each recommendation should be a clear action they can take TODAY, not just general advice.
            Example good recommendations:
            - "Apply a vitamin C serum (10-20% concentration) each morning before sunscreen to boost collagen production"
            - "Add a retinol product (0.25% to start) 2-3 nights per week to maintain your smooth texture"
            - "Double cleanse at night: oil-based cleanser first, then gentle foaming cleanser"
            
            Format your response as JSON with this structure:
            {
              "overallHealth": "good/fair/needs-attention",
              "observations": {
                "hydration": "description",
                "texture": "description", 
                "fineLines": "description",
                "concerns": "description"
              },
              "recommendations": ["specific actionable recommendation1", "specific actionable recommendation2", ...],
              "encouragement": "positive message"
            }
            
            Be supportive, specific, and actionable. Focus on healthy aging and confidence at every stage of life.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this facial image for skin health assessment."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI Response received:", content);
    
    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response if parsing fails
      analysis = {
        overallHealth: "fair",
        observations: {
          hydration: "Unable to analyze automatically",
          texture: "Please upload a clear facial photo",
          fineLines: "Analysis requires proper image",
          concerns: "Upload a well-lit photo for best results"
        },
        recommendations: [
          "Use a gentle, hydrating cleanser twice daily",
          "Apply a broad-spectrum SPF 30+ sunscreen every morning",
          "Use a moisturizer with hyaluronic acid",
          "Stay hydrated by drinking plenty of water",
          "Get adequate sleep for skin regeneration"
        ],
        encouragement: "We're here to support your skin health journey. Please try uploading a clear, well-lit photo of your face for the most accurate analysis."
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-skin function:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});