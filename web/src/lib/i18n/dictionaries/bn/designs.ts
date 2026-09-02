import type { Dictionary } from "../en";

export const designs: Dictionary["designs"] = {
  title: "আপনার ডিজাইন",
  count: (n: number) => `${n} টি কার্ড`,
  newDesign: "নতুন ডিজাইন",
  newDesignHint: "খালি ৩.৫ × ২ ইঞ্চি কার্ড থেকে শুরু",
  open: (name: string) => `${name} খুলুন`,
  edited: (when: string) => `${when} সম্পাদিত`,
  untitled: "নামহীন কার্ড",
  loading: "আপনার ডিজাইন লোড হচ্ছে…",
  failed: "ডিজাইন লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
  retry: "আবার চেষ্টা করুন",
  empty: {
    title: "এখনো কোনো ডিজাইন নেই",
    body: "আপনি যে কার্ড বানাবেন তা এখানে নিজে থেকেই সেভ হবে।",
    action: "প্রথম কার্ডটি ডিজাইন করুন",
  },
  remove: "মুছুন",
  removeConfirm: "মুছে ফেলব?",
  removeCancel: "থাক",
  removing: "মুছে ফেলা হচ্ছে…",
  guestNote:
    "এগুলো এই ব্রাউজারে সেভ আছে। সাইন ইন করলে যেকোনো ডিভাইসে পাবেন।",
  backToEditor: "এডিটরে ফিরে যান",
};
