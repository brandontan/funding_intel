# Best Practices

- **Testing**: Snapshot charts sparingly; focus on data helpers, risk-scoring math, alert triggers.
- **Error handling**: Show inline error banners with retry + timestamp, log details to Supabase `logs` table.
- **Security**: Read-only experience by default, no exchange keys stored until automation stage; if user provides webhook/phone/email, encrypt at rest.
- **Performance**: Cache funding/opportunity queries (e.g., Supabase materialized view refreshed every minute) to keep hero stats instant.
- **Observability**: Track fetch success rate, API latency, alert send durations; display trust cues on UI hero.
- **Accessibility**: Ensure tiles + tables keyboard navigable; color-coded risk badges also include text labels.
