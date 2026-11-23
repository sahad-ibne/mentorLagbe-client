# MentorLagbe

MentorLagbe is a full-stack tuition and mentorship platform built to connect students with tutors across subjects, learning modes, and schedules. Students can browse approved tuition posts, filter by subject or preferences, and manage their applications, while tutors can create tuition listings, track approval status, and review applicants from a dedicated dashboard.

## Live & Repository Links

- **Live Client:** https://mentor-lagbe-client-kappa.vercel.app
- **Live Server API:** https://mentor-lagbe-server-alpha.vercel.app
- **Server Repository:** https://github.com/sahad-ibne/mentorLagbe-server

## Key Features

- **Tuition Discovery & Filtering:** Browse approved and active tuition listings with subject categories, class levels, locations, schedules, and monthly fees.
- **Role-Based Dashboards:** Separate views and workflows for **Students** and **Tutors** (plus admin review flow for tuition listings).
- **Tuition Posting & Plan Quotas:**
  - **Free Plan:** Tutors can post up to **2 tuitions** and are guided to `/pricing` when reaching the limit.
  - **Pro Plan:** Unlocks unlimited tuition posts once upgraded.
- **Application Tracking:** Students can apply to tuitions and monitor application status, while tutors can view incoming applicants.
- **Responsive UI:** Built with Next.js App Router, Tailwind CSS, and shadcn UI components, paired with a dark slate footer and clean dashboard cards.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn UI, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Deployment:** Vercel
