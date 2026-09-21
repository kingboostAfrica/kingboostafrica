// Social media platforms the admin can link to (Admin > Social media).

export type SocialPlatform = { key: string; label: string; placeholder: string };

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourname" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/yourname" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourname" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourcompany" },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/yourname" },
  { key: "snapchat", label: "Snapchat", placeholder: "https://snapchat.com/add/yourname" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/yourname" },
];

export type SocialLink = { platform: string; url: string };

export const platformLabel = (key: string) => SOCIAL_PLATFORMS.find((p) => p.key === key)?.label ?? key;

/** Only real https:// addresses are accepted (this also blocks javascript: and similar). */
export function isValidSocialUrl(value: string): boolean {
  if (!/^https:\/\/[^\s]+$/i.test(value) || value.length > 500) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}
