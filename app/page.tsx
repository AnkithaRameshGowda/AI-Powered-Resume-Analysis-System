import Link from "next/link";
import { BriefcaseIcon, SearchIcon, FileTextIcon, MessageSquareIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full mx-auto text-center">

        <div className="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          AI-Powered Job Matching
        </div>

        <h1 className="text-5xl font-semibold leading-tight mb-4">
          Find your next role<br />with{" "}
          <span className="text-green-500">JobMatch AI</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Your AI career partner — match smarter, optimize your resume, and connect directly with recruiters.
        </p>

        <div className="flex gap-3 justify-center mb-16">
          <Link href="/login">
            <button className="bg-foreground text-background px-7 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="border border-border px-7 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">
              Sign Up
            </button>
          </Link>
        </div>

        <hr className="border-border mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-card border border-border rounded-xl p-5 text-left">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
              <SearchIcon className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="font-medium text-sm mb-1.5">Smart Matching</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">AI-powered job recommendations based on your skills and experience.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 text-left">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <FileTextIcon className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="font-medium text-sm mb-1.5">Resume Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Instant feedback on how well your resume matches job requirements.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 text-left">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
              <MessageSquareIcon className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-medium text-sm mb-1.5">Direct Connect</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Message recruiters and track your application status in real-time.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[["AI", "Powered screening"], ["3", "Analysis modes"], ["100%", "Free to use"]].map(([num, label]) => (
            <div key={label} className="bg-muted rounded-lg py-4">
              <div className="text-2xl font-medium">{num}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}