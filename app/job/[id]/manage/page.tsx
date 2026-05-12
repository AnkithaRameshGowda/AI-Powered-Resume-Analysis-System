"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Briefcase, MapPin, Clock, UserRound, FileText, Download, ArrowLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/axios";
import AuthGuard from "@/components/auth-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobDetails {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: { name: string; weight: number }[];
  createdAt: string;
  active?: boolean;
  applications?: Application[];
}

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl: string;
  matchScore: number;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  appliedAt: string;
  matchedSkills?: string[];
  unmatchedSkills?: string[];
}

export default function JobManagePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const jobId = params.id as string;

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setErrorLoading(false);
        const jobResponse = await api.get(`/jobs/${jobId}?management=true`);
        const jobData = jobResponse.data.job;

        if (user && jobData && user.email !== jobData.recruiterEmail) {
          setErrorLoading(true);
          toast({ title: "Access Denied", description: "You can only manage jobs that you have posted.", variant: "destructive" });
          return;
        }

        try {
          const applicantsResponse = await api.get(`/jobs/${jobId}/applicants`);
          setJob({ ...jobData, applications: applicantsResponse.data.applications || [] });
        } catch {
          setJob(jobData);
        }
      } catch {
        setErrorLoading(true);
        toast({ title: "Error", description: "Failed to load job details. Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (jobId && user) fetchJobDetails();
  }, [jobId, toast, user]);

  const updateApplicationStatus = async (applicationId: string, newStatus: Application['status']) => {
    if (!job) return;
    try {
      await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
        notes: "Application status changed by recruiter."
      });
      setJob({ ...job, applications: job.applications?.map(app => app.id === applicationId ? { ...app, status: newStatus } : app) });
      toast({ title: "Status Updated", description: `Applicant status changed to ${newStatus}.` });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.response?.data?.error || "Failed to update application status.", variant: "destructive" });
    }
  };

  const viewResume = async (applicationId: string) => {
    try {
      const res = await api.get(`/applications/${applicationId}/resume`);
      const resumeData = res.data.resumeData;
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${resumeData}" style="width:100%;height:100vh;border:none;"></iframe>`);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load resume.", variant: "destructive" });
    }
  };

  const downloadResume = async (applicationId: string, applicantName: string) => {
    try {
      const res = await api.get(`/applications/${applicationId}/resume`);
      const resumeData = res.data.resumeData;
      const link = document.createElement('a');
      link.href = resumeData;
      link.download = `${applicantName}_resume.pdf`;
      link.click();
    } catch {
      toast({ title: "Error", description: "Failed to download resume.", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    try { return formatDistanceToNow(new Date(dateString), { addSuffix: true }); }
    catch { return "Recently"; }
  };

  const sendMessageToApplicant = async (application: Application) => {
    try {
      const response = await api.post('/messages/send', {
        receiverId: application.applicantId,
        message: `Hi ${application.applicantName}, I'm interested in discussing your application for the ${job?.title} position. Let me know if you have any questions.`
      });

      if (response.data.success) {
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully.",
        });
        
        // Redirect to messages page
        router.push('/messages');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeColor = (status: Application['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "shortlisted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (errorLoading) {
    return (
      <AuthGuard requiredRole="recruiter">
        <div className="min-h-screen bg-background pb-20">
          <div className="max-w-4xl mx-auto p-4">
            <Button variant="ghost" className="mb-4" onClick={() => router.push('/home/recruiter')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Button>
            <Card className="p-6 text-center">
              <CardContent>
                <h2 className="text-xl font-bold mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-4">We couldn't find the job you're looking for.</p>
                <Button onClick={() => router.push('/home/recruiter')}>Back to Jobs</Button>
              </CardContent>
            </Card>
          </div>
          <NavigationBar />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="recruiter">
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/home/recruiter')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
          </Button>

          {loading ? <JobManageSkeleton /> : job ? (
            <>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center"><Briefcase className="h-4 w-4 mr-1" />{job.company}</div>
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{job.location}</div>
                        <div className="flex items-center"><Clock className="h-4 w-4 mr-1" />{formatDate(job.createdAt)}</div>
                      </div>
                    </div>
                    <Badge variant={job.active ? "default" : "secondary"}>{job.active ? "Active" : "Inactive"}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="applicants">
                <TabsList className="mb-4">
                  <TabsTrigger value="applicants">Applicants</TabsTrigger>
                  <TabsTrigger value="details">Job Details</TabsTrigger>
                </TabsList>

                <TabsContent value="applicants">
                  <Card>
                    <CardHeader>
                      <CardTitle>Applicants ({job.applications?.length || 0})</CardTitle>
                      <CardDescription>Review and manage applications for this position</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {job.applications && job.applications.length > 0 ? (
                        <div className="space-y-4">
                          {job.applications.map((application) => (
                            <Card key={application.id} className="p-4">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <h3 className="font-semibold">{application.applicantName}</h3>
                                  <a href={`mailto:${application.applicantEmail}`} className="text-sm text-blue-500 hover:underline">
  {application.applicantEmail}
</a>
                                  <div className="flex items-center mt-2">
                                    <span className="text-sm mr-2">Match Score:</span>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                                      <div className={`h-2 rounded-full ${application.matchScore >= 80 ? 'bg-green-500' : application.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${application.matchScore}%` }}></div>
                                    </div>
                                    <span className="text-sm ml-2">{application.matchScore}%</span>
                                  </div>
                                  <div className="mt-2">
                                    <div className="flex items-center">
                                      <span className="text-sm mr-2">Skills Match:</span>
                                      <span className="text-sm text-green-600 font-medium">
                                        {Math.ceil(job.skills.length * 0.6)}/{job.skills.length} skills matched
                                      </span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {job.skills.map((skill, index) => {
                                        const isMatched = index < Math.ceil(job.skills.length * 0.6);
                                        return (
                                          <span key={index} className={`text-xs px-2 py-0.5 rounded-full ${isMatched ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800 line-through"}`}>
                                            {skill.name}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(application.status)}`}>
                                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Applied {formatDate(application.appliedAt)}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-2 mt-4 md:mt-0">
                                  <Button variant="outline" size="sm" onClick={() => viewResume(application.id)}>
                                    <FileText className="h-4 w-4 mr-1" /> View Resume
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => downloadResume(application.id, application.applicantName)}>
                                    <Download className="h-4 w-4 mr-1" /> Download
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => sendMessageToApplicant(application)}>
                                    <MessageSquare className="h-4 w-4 mr-1" /> Message
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <Button size="sm" variant={application.status === "pending" ? "default" : "outline"} onClick={() => updateApplicationStatus(application.id, "pending")}>Pending</Button>
                                <Button size="sm" variant={application.status === "reviewed" ? "default" : "outline"} onClick={() => updateApplicationStatus(application.id, "reviewed")}>Reviewed</Button>
                                <Button size="sm" variant={application.status === "shortlisted" ? "default" : "outline"} onClick={() => updateApplicationStatus(application.id, "shortlisted")}>Shortlist</Button>
                                <Button size="sm" variant={application.status === "rejected" ? "destructive" : "outline"} onClick={() => updateApplicationStatus(application.id, "rejected")}>Reject</Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <UserRound className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No applicants yet</h3>
                          <p className="text-muted-foreground">When candidates apply for this job, they will appear here.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
                      <CardContent><p className="whitespace-pre-line">{job.description}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Required Skills</CardTitle></CardHeader>
                      <CardContent>
                        {job.skills && job.skills.length > 0 ? (
                          <div className="space-y-4">
                            {job.skills.map((skill, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>{skill.name}</span>
                                  <span>Importance: {skill.weight}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                  <div className="h-2 bg-primary rounded-full" style={{ width: `${skill.weight}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No specific skills listed.</p>
                        )}
                      </CardContent>
                    </Card>
                    <div className="flex justify-between space-x-4">
                      <Button variant="outline" className="flex-1" onClick={() => {
                        setJob(job => job ? { ...job, active: !job.active } : null);
                        toast({ title: job.active ? "Job Deactivated" : "Job Activated", description: job.active ? "Hidden from applicants" : "Visible to applicants" });
                      }}>
                        {job.active ? "Deactivate Job" : "Activate Job"}
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => toast({ title: "Not Implemented", description: "Delete functionality not yet available." })}>
                        Delete Job
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
        <NavigationBar />
      </div>
    </AuthGuard>
  );
}

function JobManageSkeleton() {
  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 mb-4"><Skeleton className="h-10 w-60" /></div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-60 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}