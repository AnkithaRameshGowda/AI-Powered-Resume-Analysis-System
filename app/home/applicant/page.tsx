"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Search, Briefcase, MapPin, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/auth-guard";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: Array<{ name: string; weight: number }>;
  createdAt: string;
  active?: boolean;
}

interface AppliedJob {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: string;
  appliedAt: string;
  matchScore: number;
}

export default function ApplicantHomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, appliedRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications/status')
        ]);
        setJobs(jobsRes.data.jobs || []);
        setAppliedJobs(appliedRes.data.applications || []);
      } catch (error: any) {
        toast({ title: "Error", description: "Failed to load jobs.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const appliedJobIds = new Set(appliedJobs.map(a => a.jobId));

  const filteredJobs = jobs.filter(job =>
  !appliedJobIds.has(job._id) && (
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.skills && job.skills.some(skill => skill.name.toLowerCase().includes(searchQuery.toLowerCase())))
  )
);

  const formatDate = (dateString: string) => {
    try { return formatDistanceToNow(new Date(dateString), { addSuffix: true }); }
    catch { return "Recently"; }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted": return "text-green-600";
      case "rejected": return "text-red-600";
      case "reviewed": return "text-blue-600";
      default: return "text-yellow-600";
    }
  };

  return (
    <AuthGuard requiredRole="applicant">
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Welcome, Job Seeker!</h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search jobs by title, company, location or skills..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <Link href="/ai-resume"><Button>Optimize Resume</Button></Link>
          </div>

          {/* Applied Jobs Section */}
          {appliedJobs.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Applied Jobs
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <div className="space-y-3">
                {appliedJobs.map((app) => (
                  <Card key={app.id} className="border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{app.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground">{app.companyName}</p>
                          <p className="text-xs mt-1">Applied {formatDate(app.appliedAt)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium capitalize ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          {app.matchScore > 0 && (
                            <p className="text-xs text-muted-foreground">{app.matchScore}% match</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-6 mb-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs text-muted-foreground px-2">Available Jobs</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10"><p>Loading available jobs...</p></div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No matching jobs found</h3>
              <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Link href={`/job/${job._id}`} key={job._id}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center"><Briefcase className="h-4 w-4 mr-1" />{job.company}</div>
                            <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{job.location}</div>
                            <div className="flex items-center"><Clock className="h-4 w-4 mr-1" />{formatDate(job.createdAt)}</div>
                          </div>
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.skills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">{skill.name}</span>
                              ))}
                              {job.skills.length > 3 && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">+{job.skills.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button variant="secondary">View Job</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        <NavigationBar />
      </div>
    </AuthGuard>
  );
}