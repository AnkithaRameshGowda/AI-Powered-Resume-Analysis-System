"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { ExternalLink, Sparkles, UserIcon, BookOpen } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface Course {
  title: string;
  platform: string;
  url: string;
}

interface SkillRecommendation {
  skill: string;
  why: string;
  courses: Course[];
}

export default function SuggestionsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  // Get user-specific storage key
  const getUserStorageKey = (key: string) => {
    const userId = user?.email || 'anonymous';
    return `${key}_${userId}`;
  };

  // Clear old localStorage data when user changes
  useEffect(() => {
    if (user?.email) {
      // Clear any old global storage keys (migration)
      const oldKeys = ['skillRecommendations'];
      oldKeys.forEach(key => localStorage.removeItem(key));
    }
  }, [user?.email]);

  useEffect(() => {
    const userRecommendationsKey = getUserStorageKey('skillRecommendations');
    const storedRecommendations = localStorage.getItem(userRecommendationsKey);
    
    // Debug logging to track ATS feedback retrieval
    console.log(`DEBUG: Loading ATS recommendations for user: ${user?.email}`);
    console.log(`DEBUG: Recommendations storage key: ${userRecommendationsKey}`);
    console.log(`DEBUG: Found stored recommendations: ${storedRecommendations ? 'YES' : 'NO'}`);
    
    if (storedRecommendations) {
      try {
        const parsedRecommendations = JSON.parse(storedRecommendations);
        setRecommendations(parsedRecommendations);
        setResumeUploaded(true);
        console.log(`DEBUG: Loaded ${parsedRecommendations.length} recommendations for user: ${user?.email}`);
      } catch (e) {
        console.error("Error parsing stored recommendations:", e);
      }
    }
    setLoading(false);
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Skill Development Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations to enhance your career prospects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading recommendations...</p>
              </div>
            ) : !resumeUploaded ? (
              <div className="text-center py-12 space-y-4">
                <UserIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold">No Resume Analyzed Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  To get personalized skill development suggestions, please upload your resume in the AI Resume Analyzer section.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/ai-resume">Go to AI Resume Analyzer</a>
                </Button>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <p>No skill recommendations available yet. Try analyzing your resume again.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="text-xs text-muted-foreground px-2">Previous Scan Suggestions</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                {recommendations.map((recommendation, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="bg-primary h-2"></div>
                    <CardHeader>
                      <CardTitle className="text-xl">{recommendation.skill}</CardTitle>
                      <CardDescription>{recommendation.why}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium flex items-center mb-3">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Recommended Learning Resources
                      </h4>
                      <div className="space-y-3">
                        {recommendation.courses.map((course, courseIndex) => (
                        <a
                            key={courseIndex}
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start justify-between p-3 border rounded-md hover:bg-muted transition-colors"
                          >
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-muted-foreground">{course.platform}</div>
                            </div>
                            <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <NavigationBar />
    </div>
  );
}