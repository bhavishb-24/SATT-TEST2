'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'SAT Sage <onboarding@resend.dev>'
const NOTIFY = process.env.NOTIFY_EMAIL ?? ''

export async function sendNewUserNotification({
  name,
  email,
  inviteCode,
}: {
  name: string
  email: string
  inviteCode: string
}) {
  if (!NOTIFY || !process.env.RESEND_API_KEY) return

  try {
    await resend.emails.send({
      from: FROM,
      to: NOTIFY,
      subject: `New sign-up: ${name || email}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 16px;font-size:20px">New SAT Sage sign-up</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#666;width:120px">Name</td>
              <td style="padding:8px 0;font-weight:600">${name || '—'}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666">Email</td>
              <td style="padding:8px 0;font-weight:600">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666">Invite code</td>
              <td style="padding:8px 0;font-family:monospace;font-weight:600">${inviteCode}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666">Time</td>
              <td style="padding:8px 0">${new Date().toUTCString()}</td>
            </tr>
          </table>
        </div>
      `,
    })
  } catch (err) {
    // Never let email failure break sign-up
    console.error('[v0] Resend notification failed:', err)
  }
}
