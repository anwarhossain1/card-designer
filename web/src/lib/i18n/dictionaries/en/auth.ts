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
    generic: "Something went wrong. Please try again.",
  },
  /** Designs are still on this device until saved projects land. */
  localNote:
    "Your current design stays in this browser for now — signing in does not move it yet.",
  backHome: "Back to home",
};
