/*
 * POST /api/contact: the Mail app's contact form.
 *
 * How to configure (Formspree):
 * 1. Create a free account at https://formspree.io and a new form; set its email to mejri.seyf@gmail.com.
 * 2. Copy the form endpoint (https://formspree.io/f/xxxxxxx) or just its ID (xxxxxxx).
 * 3. Put it in .env.local as FORMSPREE_ENDPOINT=... (see .env.example) and in your host's environment
 *    variables when deploying, then restart the server.
 * 4. In the form's Settings, turn reCAPTCHA off: messages are sent from this server, not a browser
 *    form, so Formspree can't show a captcha and would reject them (403).
 * Messages arrive by email with Reply-To set to the visitor, so you can answer directly.
 * 2. Resend (or any email API): `npm i resend`, set RESEND_API_KEY, and replace `forward()` below with
 *    `new Resend(process.env.RESEND_API_KEY).emails.send({ from, to, replyTo: email, subject, text: message })`.
 *
 * Without configuration the route answers 503 `{ ok: false, configured: false }` and the Mail app offers a
 * mailto: link instead. The message body is never logged.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_BODY_BYTES = 20_000

type Payload = { name: string; email: string; subject: string; message: string }

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")

function validate(input: Record<string, unknown>): { data: Payload; errors: Record<string, string> } {
  const data = {
    name: str(input.name),
    email: str(input.email),
    subject: str(input.subject),
    message: str(input.message),
  }
  const errors: Record<string, string> = {}
  if (!data.name) errors.name = "Add your name."
  else if (data.name.length > 120) errors.name = "Keep the name under 120 characters."
  if (!EMAIL_RE.test(data.email) || data.email.length > 254) errors.email = "Use a valid email address, like name@example.com."
  if (data.subject.length > 200) errors.subject = "Keep the subject under 200 characters."
  if (data.message.length < 10) errors.message = "Write at least 10 characters."
  else if (data.message.length > 5000) errors.message = "Keep the message under 5000 characters."
  return { data, errors }
}

/** Accepts the full Formspree URL or just the form ID. */
function formspreeUrl(value: string) {
  const v = value.trim()
  return /^https?:\/\//.test(v) ? v : `https://formspree.io/f/${v}`
}

async function forward(endpoint: string, { name, email, subject, message }: Payload) {
  return fetch(formspreeUrl(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name,
      email,
      _replyto: email,
      _subject: subject || `New message from ${name} (portfolio)`,
      subject,
      message,
    }),
    signal: AbortSignal.timeout(10_000),
  })
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0)
  if (length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "too_large" }, { status: 413 })
  }

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const body = input as Record<string, unknown>

  // Honeypot: real visitors never see the "company" field. Pretend it worked so bots move on.
  if (str(body.company)) {
    return Response.json({ ok: true })
  }

  const { data, errors } = validate(body)
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, error: "invalid", errors }, { status: 422 })
  }

  const endpoint = process.env.FORMSPREE_ENDPOINT
  if (!endpoint) {
    return Response.json({ ok: false, configured: false }, { status: 503 })
  }

  try {
    const res = await forward(endpoint, data)
    if (!res.ok) {
      // Log why Formspree refused (status and its error codes only, never the message or address).
      let detail = ""
      try {
        const j = (await res.json()) as { errors?: { code?: string; message?: string }[] }
        detail = (j.errors ?? []).map((e) => e.code ?? e.message).join(", ")
      } catch {
        // Non-JSON error page.
      }
      const hint = res.status === 403 ? " (turn reCAPTCHA off in the form settings)" : res.status === 404 ? " (check FORMSPREE_ENDPOINT)" : ""
      console.error(`contact: Formspree answered ${res.status}${detail ? ` [${detail}]` : ""}${hint}`)
    }
    return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 502 })
  } catch (err) {
    // Log only the failure type, never the visitor's message or address.
    console.error("contact: forwarding failed", err instanceof Error ? err.name : "unknown error")
    return Response.json({ ok: false, error: "upstream" }, { status: 502 })
  }
}
