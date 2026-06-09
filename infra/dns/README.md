# DNS records — maverickstech.com.bd

Authoritative DNS lives in your registrar / Cloudflare. This file is the **source of truth** for what records must exist. Apply manually and check into version control whenever changed.

---

## 1. Apex + www

| Type  | Name | Value                              | TTL   | Notes |
|-------|------|------------------------------------|-------|-------|
| A     | @    | <server-public-ip>                 | 300   | Or use ALIAS/CNAME flattening if your DNS supports it. |
| AAAA  | @    | <server-public-ipv6>               | 300   | Optional. |
| CNAME | www  | maverickstech.com.bd.              | 300   | Or A → same IP. |

## 2. Email — SPF / DKIM / DMARC

Required for deliverability. Without these, transactional + marketing email from `noreply@maverickstech.com.bd` lands in spam.

### SPF (sender policy framework)

| Type | Name | Value |
|------|------|-------|
| TXT  | @    | `v=spf1 include:_spf.google.com include:amazonses.com -all` |

Adjust the `include:` providers to whatever actually sends mail (Gmail SMTP, Amazon SES, SendGrid, Mailgun, etc.). End with `-all` (hard fail) once confident; use `~all` while testing.

### DKIM

Each sending provider issues its own DKIM selector + public key. Common forms:

| Provider | Type  | Name (selector)                          | Value                              |
|----------|-------|------------------------------------------|------------------------------------|
| Google   | TXT   | `google._domainkey`                      | `v=DKIM1; k=rsa; p=<key>`          |
| SES      | CNAME | `<token1>._domainkey`                    | `<token1>.dkim.amazonses.com`      |
| SES      | CNAME | `<token2>._domainkey`                    | `<token2>.dkim.amazonses.com`      |
| SES      | CNAME | `<token3>._domainkey`                    | `<token3>.dkim.amazonses.com`      |

Get the actual selectors/keys from each provider's console after verifying domain ownership.

### DMARC

| Type | Name     | Value |
|------|----------|-------|
| TXT  | _dmarc   | `v=DMARC1; p=none; rua=mailto:dmarc@maverickstech.com.bd; ruf=mailto:dmarc@maverickstech.com.bd; fo=1; aspf=s; adkim=s; pct=100` |

Start with `p=none` (monitor only). After two weeks of clean aggregate reports, ramp to `p=quarantine; pct=25`, then `pct=100`, then `p=reject`.

### MX (only if accepting inbound mail)

| Priority | Type | Name | Value                  |
|----------|------|------|------------------------|
| 1        | MX   | @    | aspmx.l.google.com.    |
| 5        | MX   | @    | alt1.aspmx.l.google.com.|
| 5        | MX   | @    | alt2.aspmx.l.google.com.|
| 10       | MX   | @    | alt3.aspmx.l.google.com.|
| 10       | MX   | @    | alt4.aspmx.l.google.com.|

(Replace with your actual mail provider's MX values.)

### BIMI (optional, requires DMARC enforcement + VMC)

| Type | Name       | Value |
|------|------------|-------|
| TXT  | default._bimi | `v=BIMI1; l=https://maverickstech.com.bd/bimi-logo.svg; a=https://maverickstech.com.bd/vmc.pem` |

Skip until DMARC is at `p=quarantine`+.

---

## 3. Verification records (one-time, keep)

| Tool                 | Type | Name | Value                                                  |
|----------------------|------|------|--------------------------------------------------------|
| Google Search Console | TXT  | @    | `google-site-verification=<token>` *(or use meta tag via `SiteSettings.gsc_verification`)* |
| Bing Webmaster        | TXT  | @    | `<token>` *(or meta `msvalidate.01` via `bing_verification`)* |
| Facebook Domain       | TXT  | @    | `facebook-domain-verification=<token>`                |

---

## 4. CAA — restrict who can issue certs

| Type | Name | Value                              |
|------|------|------------------------------------|
| CAA  | @    | `0 issue "letsencrypt.org"`        |
| CAA  | @    | `0 issuewild "letsencrypt.org"`    |
| CAA  | @    | `0 iodef "mailto:security@maverickstech.com.bd"` |

---

## 5. CDN / CloudFront (when activated)

| Type  | Name | Value                              | Notes |
|-------|------|------------------------------------|-------|
| CNAME | cdn  | dxxxxxxxxxxx.cloudfront.net.       | Used by `AWS_S3_CUSTOM_DOMAIN=cdn.maverickstech.com.bd` |

CloudFront distribution must include an SSL cert via ACM in `us-east-1` covering `cdn.maverickstech.com.bd`.

---

## Verification checklist after applying

```bash
# SPF
dig +short TXT maverickstech.com.bd | grep -i spf
# DMARC
dig +short TXT _dmarc.maverickstech.com.bd
# DKIM (replace selector)
dig +short TXT google._domainkey.maverickstech.com.bd
# CAA
dig +short CAA maverickstech.com.bd
```

Online testers:
- https://mxtoolbox.com/spf.aspx
- https://dmarcian.com/dmarc-inspector/
- https://www.mail-tester.com/ (send a real test email)
- https://www.ssllabs.com/ssltest/

Aim for A+ on SSL Labs and 10/10 on mail-tester.
