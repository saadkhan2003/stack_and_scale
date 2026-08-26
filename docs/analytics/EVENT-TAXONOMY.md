# Public analytics event taxonomy

## Consent and data boundary

Events fire only after an explicit `granted` browser preference. The public app
does not send event data until an approved, self-hosted Umami transport is
configured. Event properties are allow-listed; form bodies, email addresses,
credentials, free text and full URLs containing query parameters are prohibited.

The browser preference is anonymous and local. It is never joined to a CRM or
authentication identity. A privacy-request deletion workflow applies to the
analytics provider only after the provider and its identifier model are
approved and recorded in the privacy processor register.

## Names

| Event | When | Allowed properties |
|---|---|---|
| `page_view` | Provider-native, after consent | route template only |
| `cta_click` | Public link/button intent | `category`, `destination` (path or mailto only) |
| `product_interest` | Product detail CTA | product slug |
| `resource_interest` | Resource CTA | resource slug, resource type |
| `contact_interest` | Contact/demo route CTA | CTA placement |
| `form_start` | Phase 09 lead form begins | form identifier only |
| `form_success` | Phase 09 lead form accepted | form identifier only |
| `booking_handoff` | Approved booking provider handoff | placement only |
| `whatsapp_handoff` | Approved WhatsApp handoff | placement only |

## Ownership and monitoring

Marketing owns event naming and weekly relevance review. Engineering owns the
consent gate, removal switch and privacy-safe Core Web Vitals collection.
Search Console ownership, sitemap submission and index-coverage monitoring must
be completed by the domain owner once the production domain is available.
