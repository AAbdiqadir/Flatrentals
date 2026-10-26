# Precision Ledger

Status: reverted at the user's request on 26 October 2026. The active app uses the original simple admin, owner and tenant dashboards, including the tenant's inline profile form. The entries below are historical design notes. The Ledger shell, dedicated profile pages, stylesheet and related integration tests have been removed. The original dashboard files, routes, header, auth service and global styles match their pre-redesign versions in `ed09173^`. Production build and the six existing Angular tests pass. Docker containers were not rebuilt.

Selected by the user. Skill style: achromatic-ledger, seed 463584233. No redraws.
Brand mapping: locally installed Manrope, white ground, charcoal ink, the existing sage reserved for status. The dealt no-sidebar shell suits the three actual destinations (dashboard, profile, listings); no invented navigation or chart.

## Inventory and questions

- The product is FlatRental; the existing public marketing brand remains unchanged.
- Admin, Owner and Tenant use existing authenticated, role-guarded routes.
- The account API returns full name, email, ID and role; only name and email are self-editable.
- Profile question: Are my rental account details correct, and can I update them?
- Primary profile action: save changed personal details with inline validation and server feedback.
- Signature: account identity and assigned rental role, followed by the permissions that role actually has.
- Tenant question: What is happening with my booking requests? First block: bookings and their next action.
- Owner question: Which booking requests need a decision? First block: incoming requests, then properties.
- Admin question: Which users, properties and bookings can I manage? Tables retain all existing actions.
- Existing counts are API-derived. No growth figures or invented metrics.
- No photos exist for the account: a stable initials avatar is honest and functional.
- No security, upload or notification settings are invented without supporting endpoints.

## Layout and words

One centred 1152px content column, equal outer margins. Profile rows: 320px description + 48px gap + remaining 784px panel at desktop. Below 720px descriptions stack above their panels. Header navigation folds to a labelled menu at tablet width. Touch targets >=44px on phone.

Profile: My profile / Your personal details, connected to your rental account.
Identity: actual account initials, full name, email and assigned role.
Personal information: Keep your name and email address up to date. / Full name / Email address / Save changes / Cancel.
Account access: Your role determines what you can manage. / Actual role and its true capability description.
Current session: Sign out of this account on this browser. / Sign out.

## Verification data

The local preview-server.mjs is an isolated HTTP fixture proxy for screenshots and interaction checks. It is never included in Angular. Example accounts: Amina Hassan (tenant), Daniel Mwangi (owner), Nadia Yusuf (admin), Samuel Otieno (tenant). Three Nairobi flats; three booking requests. Summary counts are computed from those rows. Screens with real data use the existing API directly.

## Profile integration repair — 26 October 2026

The current checkout contained the profile and shared dashboard components but no profile routes, no shared dashboard CSS file/import, and no AuthService.updateProfileDetails implementation. The unreachable profile was therefore omitted from the Angular bundle. Existing dashboard components also rendered without the shared shell.

Restored the role-guarded dashboard/profile route trees, the auth identity helper, and the approved scoped stylesheet recovered from the last verified production CSS artifact. The CSS compiles to the same styles-W6NNZJT4.css asset. Added authenticated desktop and mobile profile links to the public listings header. Profile validation focus runs after Angular updates the fields, and confirmation dialogs wait for their view updates.

Validation: production build passed; 14 Angular tests passed, including eight integration regressions covering all three roles, applied styles, profile navigation and saving, desktop/mobile links, logged-out redirects and role restrictions. The public header test uses the HTTP testing providers required by its existing auth dependency. Existing marketing-component CSS budget warnings remain unchanged.

The production bundle was served directly with isolated API fixtures using preview-server.mjs --production --port 4400. The profile inspector reports 0 FAIL and 0 WARN at 1440, 768 and 390 pixels. All six final screenshot files were opened. The restored profile retains aligned two-column desktop sections, stacked phone fields, neutral chrome and the approved account identity treatment. Source lint reports 0 FAIL and one justified warning for the floating dialog's shadow. No new style draw or external assets were needed.

The Dockerfile already packages this production output. Docker containers and the live deployment were not accessed or rebuilt during the repair. Deployment must include frontend/src/styles/dashboard.css as well as the updated source files before rebuilding the frontend image.
