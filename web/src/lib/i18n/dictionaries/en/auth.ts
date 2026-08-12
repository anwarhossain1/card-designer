export const auth = {
  nav: {
    signIn: "Sign in",
    signUp: "Sign up",
    account: "Account",
    accountMenu: "Account menu",
    signOut: "Sign out",
    signingOut: "Signing out…",
  },
  signIn: {
    title: "Welcome back",
    subtitle: "Sign in to keep your designs with you.",
    submit: "Sign in",
    busy: "Signing in…",
    switchPrompt: "New to CardCraft?",
    switchAction: "Create an account",
  },
  signUp: {
    title: "Create your account",
    subtitle: "Your designs, saved and waiting on any device.",
    submit: "Create account",
    busy: "Creating account…",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
  },
  fields: {
    name: "Full name",
    namePlaceholder: "Anwar Hossain",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordHint: "At least 8 characters",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  validation: {
    nameShort: "Enter your name — at least 2 characters.",
    emailInvalid: "Enter a valid email address.",
    passwordShort: "Use at least 8 characters.",
    passwordEmpty: "Enter your password.",
  },
  errors: {
    invalidCredentials: "Wrong email or password.",
    emailTaken: "That email already has an account.",
    suspended: "This account has been suspended.",
    offline: "Could not reach the server. Check your connection.",
    tooMany: "Too many attempts. Wait a few minutes and try again.",
    generic: "Something went wrong. Please try again.",
  },
  forgot: {
    link: "Forgot password?",
    title: "Reset your password",
    subtitle: "We will email you a link to set a new one.",
    submit: "Send reset link",
    busy: "Sending…",
    sentTitle: "Check your inbox",
    sentBody: (email: string) =>
      `If ${email} has an account, a reset link is on its way. It works for 15 minutes.`,
    backToSignIn: "Back to sign in",
  },
  reset: {
    title: "Set a new password",
    subtitle: "Pick one you do not use anywhere else.",
    newPassword: "New password",
    submit: "Save new password",
    busy: "Saving…",
    doneTitle: "Password changed",
    doneBody:
      "You have been signed out on every device. Sign in with your new password.",
    invalidLink:
      "This reset link is invalid or has expired. Links last 15 minutes.",
    requestNew: "Request a new link",
    missingToken: "This link is incomplete. Request a new one.",
  },
  /** Designs are still on this device until saved projects land. */
  localNote:
    "Your current design stays in this browser for now — signing in does not move it yet.",
  backHome: "Back to home",
};
