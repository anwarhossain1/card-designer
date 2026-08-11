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
    namePlaceholder: "আনোয়ার হোসেন",
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
    generic: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",
  },
  localNote:
    "আপনার এখনকার ডিজাইন আপাতত এই ব্রাউজারেই থাকছে — সাইন ইন করলে এটি এখনো সরে যায় না।",
  backHome: "হোমে ফিরে যান",
};
