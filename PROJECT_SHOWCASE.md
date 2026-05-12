# Project Showcase — AI-Powered Resume Analysis & Job Matching System

> **Developed by Ankitha Ramesh Gowda**
> 📄 [Research Paper (DOI)](https://www.doi.org/10.59256/ijsreat.20250506017) · 🔙 [Back to README](./README.md)

This document contains the full visual walkthrough of the application — UI screenshots, workflow demonstrations, and ATS report samples. Source code and setup instructions are in the main [README.md](./README.md).

---

## Table of Contents

1. [Home Page & Landing](#1-home-page--landing)
2. [Authentication](#2-authentication)
3. [Recruiter Dashboard](#3-recruiter-dashboard)
4. [Job Posting & Management](#4-job-posting--management)
5. [Applicant Dashboard](#5-applicant-dashboard)
6. [Job Discovery & Application](#6-job-discovery--application)
7. [ATS Resume Analysis](#7-ats-resume-analysis)
8. [Notifications System](#8-notifications-system)
9. [Messaging System](#9-messaging-system)
10. [ATS Reports](#10-ats-reports)
11. [Mobile Responsiveness](#11-mobile-responsiveness)

---

## 1. Home Page & Landing

The landing page introduces the platform with role-based entry points for recruiters and applicants.

![Home Page](./screenshots/home.png)

> *Modern, responsive landing with clear call-to-actions for both user roles.*

---

## 2. Authentication

Secure registration and login with role selection (Recruiter / Applicant). JWT tokens are issued on successful authentication.

**Registration:**
![Register Page](./screenshots/register.png)

**Login:**
![Login Page](./screenshots/login.png)

> *Role-based auth ensures recruiters and applicants see entirely different dashboards and data.*

---

## 3. Recruiter Dashboard

The recruiter home screen provides an overview of posted jobs, incoming applications, AI match scores, and quick actions.

![Recruiter Dashboard](./screenshots/recruiter-dashboard.png)

**Application Review Panel:**

The review panel shows each candidate ranked by AI-computed compatibility score, with expandable analysis details.

![Application Review](./screenshots/recruiter-application-review.png)

**Candidate Insights:**

Detailed breakdown of a candidate's matched skills, missing skills, and ATS score alongside resume content.

![Candidate Insights](./screenshots/recruiter-candidate-insights.png)

> *Recruiters can accept or reject applications in one click. Automated, personalized feedback is sent to the applicant immediately.*

---

## 4. Job Posting & Management

Recruiters can create job listings with a full description and a weighted skills list. The skill weights influence the AI compatibility scoring.

**Create Job:**
![Create Job Form](./screenshots/job-create.png)

**Manage Jobs:**
![Job Management](./screenshots/job-manage.png)

> *Skill weights allow recruiters to signal which qualifications are critical vs. nice-to-have — the AI respects these priorities in scoring.*

---

## 5. Applicant Dashboard

Applicants see a personalized dashboard with a summary of their application statuses, recent activity, and quick links to continue applying.

![Applicant Dashboard](./screenshots/applicant-dashboard.png)

**Application Status Tracker:**

![Application Status](./screenshots/applicant-application-status.png)

> *Each application card shows current status (Pending / Accepted / Rejected), the match score received, and any feedback from the recruiter.*

---

## 6. Job Discovery & Application

Applicants can browse active job listings, filter by role or location, and apply with resume upload in one flow.

**Browse Jobs:**
![Job Listings](./screenshots/job-listings.png)

**Apply for a Job:**

The application form accepts PDF or DOCX resumes. On submission, the ATS analysis runs automatically.

![Apply Flow](./screenshots/apply-flow.png)

---

## 7. ATS Resume Analysis

The core AI feature. After a resume is uploaded, the system runs it through the ATS and Job Matching services powered by Google Gemini AI.

**ATS Score Overview:**

![ATS Score](./screenshots/ats-score.png)

**Skill Match Breakdown:**

Visual breakdown of matched vs. missing skills with percentage weights.

![Skill Match](./screenshots/ats-skill-match.png)

**Improvement Suggestions:**

The AI generates specific, actionable recommendations to improve the resume for the target role.

![ATS Suggestions](./screenshots/ats-suggestions.png)

**Course Recommendations:**

Based on identified skill gaps, the system recommends learning resources.

![Course Recommendations](./screenshots/ats-course-recommendations.png)

> *ATS score is out of 100 and accounts for keyword relevance, formatting quality, section completeness, and skill alignment with the job description.*

---

## 8. Notifications System

Both recruiters and applicants receive real-time notifications for key events — new applications, status changes, and new messages.

**Recruiter Notifications:**
![Recruiter Notifications](./screenshots/notifications-recruiter.png)

**Applicant Notifications:**
![Applicant Notifications](./screenshots/notifications-applicant.png)

> *Notifications are deduplicated and user-scoped. Each user only sees events relevant to their account.*

---

## 9. Messaging System

An in-platform messaging system connects recruiters and applicants, with conversation threads organized by job.

**Conversations List:**
![Conversations](./screenshots/messages-list.png)

**Message Thread:**
![Message Thread](./screenshots/messages-thread.png)

> *Messages are tied to a specific job context, keeping communication organized when a recruiter manages multiple roles.*

---

## 10. ATS Reports

Full PDF reports are generated for ATS analysis sessions, suitable for sharing or archiving.

| Report | Description |
|---|---|
| [Sample ATS Report](./reports/ats-report-sample.pdf) | Example full ATS analysis report |

> *Replace the sample report path above with your actual generated report file.*

---

## 11. Mobile Responsiveness

The application is fully responsive across all screen sizes.

| Mobile View | Tablet View |
|---|---|
| ![Mobile](./screenshots/mobile-view.png) | ![Tablet](./screenshots/tablet-view.png) |

---

## Application Flow (End-to-End)

```
Applicant registers → Browses jobs → Uploads resume → Applies
        │
        ▼
ATS Service analyzes resume (Gemini AI)
        │
        ▼
Job Matching AI computes compatibility score
        │
        ▼
Recruiter receives notification → Reviews ranked candidates
        │
        ▼
Recruiter accepts or rejects → Automated feedback sent
        │
        ▼
Applicant receives notification with score + improvement tips
```

---

## Screenshots Index

> **Note to maintainer:** Replace placeholder paths below with actual screenshot files before final portfolio submission.

| Screenshot File | Description |
|---|---|
| `screenshots/home.png` | Landing page |
| `screenshots/register.png` | Registration form |
| `screenshots/login.png` | Login screen |
| `screenshots/recruiter-dashboard.png` | Recruiter main dashboard |
| `screenshots/recruiter-application-review.png` | Application review panel |
| `screenshots/recruiter-candidate-insights.png` | Candidate detail view |
| `screenshots/job-create.png` | Create job form |
| `screenshots/job-manage.png` | Job management list |
| `screenshots/applicant-dashboard.png` | Applicant dashboard |
| `screenshots/applicant-application-status.png` | Application status view |
| `screenshots/job-listings.png` | Job browse page |
| `screenshots/apply-flow.png` | Resume upload + apply |
| `screenshots/ats-score.png` | ATS score result |
| `screenshots/ats-skill-match.png` | Skill match chart |
| `screenshots/ats-suggestions.png` | AI improvement suggestions |
| `screenshots/ats-course-recommendations.png` | Course recommendations |
| `screenshots/notifications-recruiter.png` | Recruiter notifications |
| `screenshots/notifications-applicant.png` | Applicant notifications |
| `screenshots/messages-list.png` | Conversations list |
| `screenshots/messages-thread.png` | Message thread view |
| `screenshots/mobile-view.png` | Mobile layout |
| `screenshots/tablet-view.png` | Tablet layout |

---

*Back to [README.md](./README.md)*
