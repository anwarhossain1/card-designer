import type { Dictionary } from "../en";

export const auth: Dictionary["auth"] = {
  nav: {
    signIn: "সাইন ইন",
    signUp: "অ্যাকাউন্ট খুলুন",
    account: "অ্যাকাউন্ট",
    accountMenu: "অ্যাকাউন্ট মেনু",
    signOut: "সাইন আউট",
    signingOut: "সাইন আউট হচ্ছে…",
  },
  signIn: {
    title: "আবার স্বাগতম",
    subtitle: "সাইন ইন করলে আপনার ডিজাইন আপনার সঙ্গেই থাকবে।",
    submit: "সাইন ইন",
    busy: "সাইন ইন হচ্ছে…",
    switchPrompt: "CardCraft-এ নতুন?",
    switchAction: "অ্যাকাউন্ট খুলুন",
  },
  signUp: {
    title: "অ্যাকাউন্ট তৈরি করুন",
    subtitle: "আপনার ডিজাইন সেভ থাকবে, যেকোনো ডিভাইসে খুলবে।",
    submit: "অ্যাকাউন্ট তৈরি করুন",
    busy: "অ্যাকাউন্ট তৈরি হচ্ছে…",
    switchPrompt: "আগে থেকেই অ্যাকাউন্ট আছে?",
    switchAction: "সাইন ইন করুন",
  },
  fields: {
    name: "পুরো নাম",
    namePlaceholder: "তানভীর আহমেদ",
    email: "ইমেইল",
    emailPlaceholder: "you@example.com",
    password: "পাসওয়ার্ড",
    passwordHint: "অন্তত ৮ অক্ষর",
    showPassword: "পাসওয়ার্ড দেখান",
    hidePassword: "পাসওয়ার্ড লুকান",
  },
  validation: {
    nameShort: "আপনার নাম লিখুন — অন্তত ২ অক্ষর।",
    emailInvalid: "সঠিক ইমেইল ঠিকানা লিখুন।",
    passwordShort: "অন্তত ৮ অক্ষর ব্যবহার করুন।",
    passwordEmpty: "পাসওয়ার্ড লিখুন।",
  },
  errors: {
    invalidCredentials: "ইমেইল বা পাসওয়ার্ড ভুল।",
    emailTaken: "এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে।",
    suspended: "এই অ্যাকাউন্টটি স্থগিত করা হয়েছে।",
    offline: "সার্ভারে পৌঁছানো যায়নি। ইন্টারনেট সংযোগ দেখুন।",
    tooMany: "অনেকবার চেষ্টা করা হয়েছে। কয়েক মিনিট পর আবার চেষ্টা করুন।",
    generic: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",
  },
  forgot: {
    link: "পাসওয়ার্ড ভুলে গেছেন?",
    title: "পাসওয়ার্ড রিসেট করুন",
    subtitle: "নতুন পাসওয়ার্ড দেওয়ার লিংক আপনার ইমেইলে পাঠাব।",
    submit: "রিসেট লিংক পাঠান",
    busy: "পাঠানো হচ্ছে…",
    sentTitle: "ইমেইল দেখুন",
    sentBody: (email: string) =>
      `${email} ঠিকানায় অ্যাকাউন্ট থাকলে রিসেট লিংক পাঠানো হয়েছে। লিংকটি ১৫ মিনিট কাজ করবে।`,
    backToSignIn: "সাইন ইনে ফিরে যান",
  },
  reset: {
    title: "নতুন পাসওয়ার্ড দিন",
    subtitle: "এমন একটি বাছুন যা অন্য কোথাও ব্যবহার করেন না।",
    newPassword: "নতুন পাসওয়ার্ড",
    submit: "পাসওয়ার্ড সেভ করুন",
    busy: "সেভ হচ্ছে…",
    doneTitle: "পাসওয়ার্ড বদলে গেছে",
    doneBody:
      "সব ডিভাইস থেকে সাইন আউট করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
    invalidLink:
      "এই রিসেট লিংকটি অচল বা মেয়াদ শেষ। লিংক ১৫ মিনিট কাজ করে।",
    requestNew: "নতুন লিংক চান",
    missingToken: "লিংকটি অসম্পূর্ণ। নতুন একটি লিংক নিন।",
  },
  google: {
    divider: "অথবা",
    /** Shown when the server has no GOOGLE_CLIENT_ID configured. */
    unavailable: "গুগল সাইন-ইন এই মুহূর্তে পাওয়া যাচ্ছে না।",
    failed: "গুগল সাইন-ইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।",
  },
  localNote:
    "আপনার এখনকার ডিজাইন আপাতত এই ব্রাউজারেই থাকছে — সাইন ইন করলে এটি এখনো সরে যায় না।",
  backHome: "হোমে ফিরে যান",
};
