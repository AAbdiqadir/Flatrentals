# Flat Rental Listing App (ASP.NET Core + Angular)

Simple full-stack flat rental listing app with role-based dashboards and CRUD.

## Stack

- Backend: ASP.NET Core Web API (.NET 8)
- Auth: ASP.NET Core Identity + JWT + role-based authorization
- DB: SQLite + Entity Framework Core (code-first migrations)
- Frontend: Angular 17 (standalone components, plain CSS)

## Project Structure

- `bckend/` ASP.NET Core API
- `frontend/` Angular app

## Roles and Capabilities

- Tenant:
  - Browse listings
  - Manage own profile (`/api/users/me`)
  - Create/update/delete own bookings
  - Send/delete own messages
- Owner:
  - CRUD own flats
  - View booking requests for own flats
  - Message tenants/applicants
- Admin:
  - Full user management
  - Manage all flats/bookings/messages
  - Import seed flats JSON

## Seeded Default Users

Created automatically at backend startup:

- Admin: `admin@flatrent.com` / `Admin123$`
- Owner: `owner@flatrent.com` / `Owner123$`
- Tenant: `tenant@flatrent.com` / `Tenant123$`

## Backend Setup

From repo root:

```bash
dotnet restore bckend/bckend.csproj
dotnet ef database update --project bckend/bckend.csproj --startup-project bckend/bckend.csproj
dotnet run --project bckend/bckend.csproj
```

Backend runs on `http://localhost:5175` (from `bckend/Properties/launchSettings.json`).

Swagger UI:

- `http://localhost:5175/swagger`

### Migrations

Initial migration is included in `bckend/Migrations`.

To create a new migration later:

```bash
dotnet ef migrations add <MigrationName> --project bckend/bckend.csproj --startup-project bckend/bckend.csproj
```

## Seed Flats JSON Import

Sample file:

- `bckend/Seed/seed-flats.json`

Startup seeding reads this file and inserts flats while avoiding duplicates by key:

- `address + rentPrice + rooms`

Manual import endpoint (Admin only):

- `POST /api/import/flats?ownerId=<owner-user-id>`

## Frontend Setup

From repo root:

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:4200` and calls API at `http://localhost:5175/api`.

## Docker (Backend Only)

Run only the backend in Docker:

```bash
docker compose up --build backend
```

Backend is exposed at `http://localhost:5175`.
Run the frontend locally (`npm start` in `frontend/`) and it will access the backend at `http://localhost:5175/api`.

## Main Frontend Pages

- Login/Register
- Listings grid
- Listing details + tenant booking form + message owner
- Tenant dashboard (summary, bookings, profile)
- Owner dashboard (my flats CRUD, booking requests)
- Admin dashboard (users, flats, bookings management)

## File Uploads

Owner flat form supports multiple image upload.

- Files are saved to: `bckend/wwwroot/uploads`
- URLs are stored in DB and served statically by backend

## CompreFace Integration (Face Login MVP)

This project now includes backend endpoints for CompreFace-based face enroll/login.

### 1) Configure API key

Set these in `bckend/appsettings.json` (or environment variables):

- `CompreFace:BaseUrl` (default: `http://localhost:8000`)
- `CompreFace:RecognitionApiKey`
- `CompreFace:MinimumSimilarity` (default: `0.93`)

### 2) Run CompreFace

Run CompreFace separately using the official setup. Once running, create a recognition service/API key in the CompreFace admin UI and place that key in `CompreFace:RecognitionApiKey`.

### 3) Enroll face (authenticated)

`POST /api/faceauth/enroll`

Request body:

```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

Use a valid JWT in `Authorization: Bearer <token>`.

### 4) Login with face

`POST /api/faceauth/login`

Request body:

```json
{
  "email": "tenant@flatrent.com",
  "imageBase64": "data:image/jpeg;base64,..."
}
```

On success this returns the same JWT auth payload as normal login.

### Frontend helper methods

`AuthService` now includes:

- `loginWithFace(email, imageBase64)`
- `enrollFace(imageBase64)`
# Flatrentals
