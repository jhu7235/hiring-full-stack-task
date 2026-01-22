Hi Marcus,

Just read this — exciting news.

I’ve put together a concrete plan for what’s feasible by Friday, along with a few clarifying questions that will help us scope the demo correctly.

Multi-tenancy & subdomains
We can support multi-tenancy for the demo by standing up separate frontend + backend instances per tenant and routing each to a custom subdomain (e.g. tenant1.ourapp.com). This is straightforward to set up quickly and gives us clean data isolation for demo purposes.

For branding, since the timeline is tight, the fastest approach is to clone our existing frontend and apply tenant-specific name/logo per instance.
If they want to demo many branded tenants (e.g. 25+ or dynamic configuration), we’d need to add a lightweight branding config service instead of static clones.

👉 Key question for them: Do they want to demo multi-tenancy at small scale (a few tenants) or showcase larger-scale configuration?

Role-based access control
For the demo, we can add a simple roles table (user ↔ role ↔ tenant) and gate frontend views accordingly. To avoid risk to the current app, we can duplicate the backend for this demo environment and iterate freely.

We’ll need clarity on:

What roles exist (Admin, Manager, Member, etc.)

What each role is allowed to see or do

That directly impacts the data model and UI logic.

👉 Key question for them: What exact workflow they would like to see with the different roles?

Audit logging
We can aggregate frontend + backend logs into a single stream and either:

Expose them via an internal audit log UI, or

Forward them to their logging provider (Datadog, Splunk, etc.)

If they want third-party logging, we’ll need their provider details and credentials.

SSO (SAML 2.0)
SSO will require coordination with their identity team to exchange metadata, configure assertions, and test login flows. It’s doable, but it’s the riskiest item to fully demo by Friday due to external dependencies.

If possible, I’d recommend either:

Mocking the SSO flow for Friday, or

Deferring full SAML integration until after the demo

Let me know if that’s negotiable with them.

Post-demo path
If the demo lands well and we move toward production, we can consolidate this work back into the main app, introduce proper tenant configuration, and support both our core domain (e.g. app.ourapp.com) and customer subdomains cleanly.

Happy to walk through this live if helpful — feel free to call and I can break it down in plain English.

Cheers,
Jason