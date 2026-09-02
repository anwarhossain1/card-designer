export type MailLocale = "bn" | "en";

export interface MailContent {
  subject: string;
  html: string;
}

/**
 * Emails follow the language the app was in when the request was made.
 *
 * The account stores no locale preference, and guessing from an email address
 * is worse than asking — so the client sends the language it is currently
 * showing, which is the one the person was just reading.
 */
const layout = (heading: string, body: string, footer: string) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" align="center" style="padding:24px 0;">
      <tr><td align="center">
        <table width="560" style="background:#ffffff;border-radius:12px;padding:36px;">
          <tr><td align="center" style="font-size:20px;font-weight:bold;color:#6c4cff;padding-bottom:20px;">
            CardCraft
          </td></tr>
          <tr><td style="font-size:18px;font-weight:bold;color:#1a1a1f;padding-bottom:12px;">
            ${heading}
          </td></tr>
          <tr><td style="font-size:14px;line-height:1.7;color:#44444a;">
            ${body}
          </td></tr>
          <tr><td align="center" style="padding-top:28px;font-size:12px;color:#9a9aa2;">
            ${footer}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

const button = (href: string, label: string) => `
  <p style="margin:24px 0;">
    <a href="${href}" style="display:inline-block;background:#6c4cff;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;">
      ${label}
    </a>
  </p>
  <p style="font-size:12px;color:#9a9aa2;word-break:break-all;">${href}</p>`;

export function passwordResetEmail(
  locale: MailLocale,
  { name, resetUrl, minutes }: { name: string; resetUrl: string; minutes: number },
): MailContent {
  if (locale === "bn") {
    return {
      subject: "CardCraft — পাসওয়ার্ড রিসেট",
      html: layout(
        "পাসওয়ার্ড রিসেট করুন",
        `<p>হ্যালো ${name},</p>
         <p>আপনার CardCraft অ্যাকাউন্টের পাসওয়ার্ড বদলানোর অনুরোধ পেয়েছি। নিচের বোতামে ক্লিক করে নতুন পাসওয়ার্ড দিন।</p>
         ${button(resetUrl, "নতুন পাসওয়ার্ড দিন")}
         <p>লিংকটি ${minutes} মিনিট পর আর কাজ করবে না।</p>`,
        "আপনি অনুরোধ না করে থাকলে এই ইমেইলটি উপেক্ষা করুন — আপনার পাসওয়ার্ড অপরিবর্তিত থাকবে।",
      ),
    };
  }

  return {
    subject: "CardCraft — reset your password",
    html: layout(
      "Reset your password",
      `<p>Hello ${name},</p>
       <p>We received a request to change the password on your CardCraft account. Use the button below to set a new one.</p>
       ${button(resetUrl, "Set a new password")}
       <p>This link stops working in ${minutes} minutes.</p>`,
      "If you did not ask for this, ignore this email — your password will not change.",
    ),
  };
}

export function passwordChangedEmail(
  locale: MailLocale,
  { name, signInUrl }: { name: string; signInUrl: string },
): MailContent {
  if (locale === "bn") {
    return {
      subject: "CardCraft — পাসওয়ার্ড বদলানো হয়েছে",
      html: layout(
        "পাসওয়ার্ড বদলানো হয়েছে",
        `<p>হ্যালো ${name},</p>
         <p>আপনার CardCraft পাসওয়ার্ড বদলে গেছে। নিরাপত্তার জন্য সব ডিভাইস থেকে সাইন আউট করা হয়েছে।</p>
         ${button(signInUrl, "সাইন ইন করুন")}`,
        "এই কাজটি আপনি না করে থাকলে এখনই আমাদের জানান।",
      ),
    };
  }

  return {
    subject: "CardCraft — your password was changed",
    html: layout(
      "Your password was changed",
      `<p>Hello ${name},</p>
       <p>The password on your CardCraft account has been changed. For safety, every device has been signed out.</p>
       ${button(signInUrl, "Sign in")}`,
      "If this was not you, tell us straight away.",
    ),
  };
}
