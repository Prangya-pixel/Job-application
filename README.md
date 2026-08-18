# CareerFlow — Online Recruitment System

A full-stack MERN recruitment platform for applicants to discover and apply for roles, and administrators to manage jobs and candidate pipelines.

## Features

- JWT authentication, bcrypt password hashing, protected and role-based routes
- Job discovery with keyword, location, type, and experience filters
- Job applications with duplicate-application prevention and status tracking
- Admin dashboard, job CRUD/status management, applicant records, and application status workflow
- Responsive React + Vite interface with a reusable component and API layer

## Stack

React, Vite, React Router, Axios, Node.js, Express, MongoDB/Mongoose, JWT, and bcryptjs.

## Run locally

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and a long `JWT_SECRET`.
2. Optionally copy `client/.env.example` to `client/.env` (the provided default works locally).
3. Install dependencies: `npm install && npm run install:all`
4. Run both apps: `npm run dev`

Or run separately with `npm run dev --prefix server` and `npm run dev --prefix client`.

The client runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

## Admin account

Registration always creates applicants. To create an admin, first register normally, then update that user in MongoDB Compass/shell:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Sign out and back in to receive a token with the admin account identity.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- `GET /api/jobs`, `GET /api/jobs/:id`; admin: `POST/PUT/DELETE /api/jobs/:id`, `PATCH /api/jobs/:id/status`
- Applicant: `POST /api/applications`, `GET /api/applications/my-applications`
- Admin: `GET /api/admin/dashboard`, `GET /api/admin/applications`, `PATCH /api/admin/applications/:id/status`, `GET /api/admin/applicants`

## Collaboration

Use `main` for stable releases, `develop` for integration, and feature branches such as `feature/authentication`, `feature/applicant-module`, and `feature/admin-module`. Merge changes through reviewed pull requests with focused commits.

## Optional next steps

Add file storage for uploaded resumes (Cloudinary/S3), pagination, email notifications, audit history, automated tests, and CSRF-safe cookie-based token storage for production deployments.
