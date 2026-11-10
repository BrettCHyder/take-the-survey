# One Dollar Survey launch outreach

Status recorded November 10, 2026. These are submission receipts, not editorial acceptance or evidence of incoming traffic.

## Completed submissions

| Destination | Submission page | Visible confirmation | Status |
| --- | --- | --- | --- |
| The Useless Web | https://theuselessweb.com/ → Submit | “Your response has been recorded.” | Received; editorial decision pending |
| Odd Sites | https://www.odd-sites.com/submit | “Thanks! It’s in the queue.” | Received; editorial decision pending |
| The Useless Web Index | https://www.theuselesswebindex.com/get-involved/ | “Thank you for supporting our index.” | Received; editorial decision pending |
| BoredomBash | https://boredombash.com/submit/ | “Got it — thanks. Every submission gets looked at by a human.” | Received; editorial decision pending |
| Bored Button | https://www.boredbutton.com/add | “Thank you! We’ll review your suggestion right away.” | Received; editorial decision pending |
| OpenWeird | https://openweird.com/about/ → review | “Your response has been recorded” | Received; editorial decision pending |
| Another Useless Website | https://anotheruseless.website/submit-website/ | “Website URL submitted, Thank you!” | Received; editorial decision pending |

Submissions identify the actual project, disclose that Yes costs $1, and do not claim scientific validity, a subscription, a prize, or a donation. Creator/affiliation fields were answered honestly. Only the public support email was supplied where contact information was needed. No newsletter subscriptions, purchases, vote requests, paid placements or fake endorsements were made.

Browser screenshots were retained privately. Public repository documentation contains text receipts only.

## Published improvements

- Descriptive title and search description, canonical URL, Open Graph/Twitter large-image metadata, favicon and touch icon.
- Wide 1200×630, square 1080×1080 and story 1080×1920 artwork, all hosted on the survey domain.
- Visitor native sharing and Copy link controls; successful copy feedback verified in the live browser.
- Public About & Media page with project facts, limits, support contact and artwork downloads.
- Valid XML sitemap containing the homepage, About, Support and Privacy; robots.txt advertises it and excludes APIs.
- Static support contact text for visitors/crawlers without JavaScript.
- Public GitHub README now links directly to the live survey.

## Search-engine notification

IndexNow received the four public URLs and returned HTTP 202 (accepted; key validation pending). This is not proof of indexing or ranking. The deployed verification file returned HTTP 200 and the expected content. Google Search Console still needs an authenticated owner session; no Google submission has been claimed.

## Verification

Production deployment: dpl_D3XmPXELchLdgpgpKqHFHt2nUYMA, READY. Source commit: 487a908f4d63a53cf83d35e7f73dc76257ff0890.

Eight existing payment/security tests passed. JS syntax, sitemap XML and local asset links passed. Deployed robots.txt, sitemap, About, social-card image and survey API returned HTTP 200. The survey API remained in live mode with payments enabled. The owner reported a real successful payment; confirmed live Yes responses were visible. No new votes or payments were submitted during promotional verification.

## Deliberately not submitted

- Random Daily URLs explicitly excludes a creator’s own commercial site.
- Laughing Squid’s submission page excludes product/service promotions.
- r/InternetIsBeautiful has restrictions on paid services and self-promotion. No account is authenticated here for Reddit posting anyway.
- Cloudhiker requires an account and has a no-payment-access rule.
- Gossip’s Web has a submission fee; no ad or submission budget was authorized.
- Boing Boing’s old linked suggestion form returned 404. No duplicate email follow-up was sent.
- One Person, One Site is for lasting personal sites, not this single-purpose project.
- Awesome Useless Websites requires a contribution PR; creating an appropriate fork is not available through the current connector. No unrelated issue was opened as a substitute.

## Useful next steps when the owner is available

1. Connect Google Search Console, verify the site and submit https://onedollarsurvey.com/sitemap.xml.
2. Use an authenticated personal social account for one transparent creator post, checking the destination’s current promotion and AI-content rules first. Do not request upvotes or coordinate engagement.
3. Use https://onedollarsurvey.com/about.html as a single factual media-kit link for targeted creator outreach. A good initial target is someone already covering single-purpose or absurd websites, rather than a generic large influencer.
4. Wait for editorial decisions rather than resubmitting to the same curators. Check the support mailbox for replies.

## Second outreach pass

Seven editorial submissions have confirmed receipts in total. The two new submissions were OpenWeird and Another Useless Website. Both disclosed the paid Yes branch; OpenWeird’s backlink question was answered “Sorry, no.” No reciprocal-link commitment was made.

A base31 discovery submission was attempted. The form did not show a clear receipt, so it is not included in the confirmed total and was not resubmitted.

Additional destinations investigated:

| Destination | Actual blocker / next action |
| --- | --- |
| Pointless Sites | Live submit form requires a CAPTCHA. No attempt to solve it was made; the owner can submit at https://www.pointlesssites.com/feedback.asp?f=1. |
| WeirdWebsites.net | Registration/login required. No account was created. |
| Bored Hoard | Current /submit redirects to sign-in, despite public search text showing the form. No account was created. |
| Neatorama | Its /suggest page explicitly welcomes self-nominations, but the current browser page did not expose the described form. No suggestion was sent. |
| Jason Kottke / kottke.org | His official About page explicitly welcomes links from creators: https://also.kottke.org/about/index.html. Appropriate for one short personal email once the owner connects a sending account. No email sent. |

### Published creative distribution kit

https://onedollarsurvey.com/sharing-kit.html now includes:

- A silent, twelve-second, 1080×1920 H.264 MP4 introduction with the actual question, honest payment terms, URL and QR code.
- A square QR card and standalone QR code, opening the survey directly without a third-party tracking redirect.
- Four printable US Letter cards at /print-cards.html.
- A linked SVG badge, plus copyable HTML and Markdown embed snippets for bloggers and developers. The badge uses no scripts or embedded voting.
- Existing wide/square/story artwork and the About & Media link.

The homepage links directly to the kit. It has a canonical URL and sitemap entry; the print-only helper is noindex,follow. The kit contains real reusable material, not duplicate keyword landing pages.

### Verification of the second release

Source commit: 2f74420e36016571509aed65a4c4c428451c1eef. Production deployment dpl_46t4jhQcMabzGed3pDdwzDzVjeHn reached READY. Kit, video, badge, print page and live survey API returned HTTP 200. Live payments remained enabled.

The video played to currentTime=12, duration=12, readyState=4, with no media error. Copy HTML displayed its success feedback. All four printable cards were present and rendered within the page width. QR, square card and video end-card QR were independently decoded with zxing-cpp to exactly https://onedollarsurvey.com/. The generator is retained in scripts/generate-sharing-kit.py and adds no application runtime dependencies. Eight existing tests and JS/static asset checks passed.

The updated homepage, About and new sharing-kit URLs were sent through IndexNow following the content change. No indexing, traffic or editorial acceptance is implied by notification.
