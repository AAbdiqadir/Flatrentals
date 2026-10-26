# Precision Ledger

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
