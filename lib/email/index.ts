import "server-only";

import { emailEnv } from "@/lib/env";

/**
 * Provider-agnostic email sending. Add a provider by implementing
 * `EmailProvider` and registering it in `getEmailProvider()` — e.g. Postmark,
 * SendGrid, Amazon SES or SMTP via nodemailer.
 */

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

const consoleProvider: EmailProvider = {
  name: "console",
  async send(message) {
    console.info(
      `\n[email:console] To: ${[message.to].flat().join(", ")}\nSubject: ${message.subject}\nReply-To: ${message.replyTo ?? "-"}\n\n${message.text}\n`,
    );
  },
};

const noopProvider: EmailProvider = {
  name: "none",
  async send() {
    /* email disabled */
  },
};

function resendProvider(apiKey: string): EmailProvider {
  return {
    name: "resend",
    async send(message) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: emailEnv.from,
          to: [message.to].flat(),
          subject: message.subject,
          text: message.text,
          html: message.html,
          reply_to: message.replyTo,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Resend responded with HTTP ${response.status}`);
    },
  };
}

export function getEmailProvider(): EmailProvider {
  switch (emailEnv.provider) {
    case "resend":
      if (!emailEnv.apiKey) {
        console.error("[email] EMAIL_PROVIDER=resend but EMAIL_API_KEY is missing; emails disabled.");
        return noopProvider;
      }
      return resendProvider(emailEnv.apiKey);
    case "console":
      return consoleProvider;
    default:
      return noopProvider;
  }
}

export function isEmailConfigured(): boolean {
  return getEmailProvider().name !== "none";
}
