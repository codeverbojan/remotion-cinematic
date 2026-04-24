import type { SceneTiming, SFXEntry } from "./engine/types";
import type { CameraKeyframe, AudioCue, CursorSFXMap } from "./engine";

export const SCENE_OVERLAP = 15;

export const SCENES: SceneTiming[] = [
  { id: "chaos", durationInFrames: 260 },
  { id: "product-reveal", durationInFrames: 150 },
  { id: "feature-showcase", durationInFrames: 200 },
  { id: "headline-resolution", durationInFrames: 120 },
  { id: "closer", durationInFrames: 90 },
];

export const SPREADSHEET_COLUMNS = [
  "Name", "Email", "Status", "Date", "Amount",
] as const;

export const SPREADSHEET_ROWS = [
  ["Alex Chen", "alex@acme.co", "Pending", "Apr 12", "$2,400"],
  ["Jordan Lee", "jordan@globex.io", "Shipped", "Apr 10", "$1,800"],
  ["Sam Rivera", "sam@initech.co", "Review", "Apr 9", "$3,200"],
  ["Taylor Kim", "taylor@hooli.com", "Pending", "Apr 8", "$950"],
  ["Morgan Li", "morgan@piedpiper.co", "Approved", "Apr 7", "$4,100"],
  ["Casey Park", "casey@umbrella.io", "Pending", "Apr 6", "$2,750"],
  ["Riley Cruz", "riley@stark.co", "Shipped", "Apr 5", "$1,200"],
  ["Drew Patel", "drew@wayne.co", "Review", "Apr 4", "$5,600"],
];

export const EMAIL_THREAD = [
  { from: "Jordan Lee", subject: "Re: Q2 sample request", body: "Can you send the updated specs? Client is asking again..." },
  { from: "You", subject: "Re: Q2 sample request", body: "Sure, let me check with the warehouse on availability." },
  { from: "Jordan Lee", subject: "Re: Q2 sample request", body: "Thanks — deadline is Friday. Let me know ASAP." },
];

export const CHAT_MESSAGES = [
  { from: "Sam Rivera", text: "hey, did the order ship yet?" },
  { from: "You", text: "checking now, one sec" },
  { from: "Sam Rivera", text: "client just pinged me about it 😬" },
  { from: "Taylor Kim", text: "also — can someone update the tracking sheet?" },
  { from: "You", text: "on it, give me 5 min" },
];

export const STICKY_NOTES = [
  { color: "#FFE066", text: "Follow up with Jordan — Q2 samples" },
  { color: "#A7C7E7", text: "Update pricing sheet before Friday" },
  { color: "#FFB7C5", text: "Call warehouse re: backorder" },
];

export const NOTIFICATIONS = [
  { title: "New request", body: "Alex Chen submitted a sample request" },
  { title: "Overdue", body: "3 requests are past their SLA" },
  { title: "Shipping delay", body: "Carrier reports 2-day delay on batch #47" },
];

export const CAMERA_TIMELINE: CameraKeyframe[] = [
  { scene: "chaos", at: "start", x: 0, y: 0, scale: 1.0 },
  { scene: "chaos", at: "end", x: 0, y: 0, scale: 1.0 },
  { scene: "product-reveal", at: "start", x: 0, y: 0, scale: 1.0 },
  { scene: "product-reveal", at: "end", x: 0, y: 0, scale: 1.0 },
  { scene: "feature-showcase", at: "start", x: 0, y: 0, scale: 1.0 },
  { scene: "feature-showcase", at: "end", x: 0, y: 0, scale: 1.0 },
  { scene: "headline-resolution", at: "start", x: 0, y: 0, scale: 1.0 },
  { scene: "headline-resolution", at: "end", x: 0, y: 0, scale: 1.0 },
  { scene: "closer", at: "start", x: 0, y: 0, scale: 1.0 },
  { scene: "closer", at: "end", x: 0, y: 0, scale: 1.0 },
];

// --- SFX Configuration ---
// All sound files live in public/sfx/. The framework auto-plays these
// based on actions — no manual frame timing needed.

// Cursor-driven SFX — fires automatically on cursor actions.
export const CURSOR_SFX: CursorSFXMap = {
  click: { src: "sfx/ui/click.mp3", volume: 0.4 },
  drag:  { src: "sfx/ui/click.mp3", volume: 0.35 },
};

// Scene transition SFX — fires when ScenePush enters.
// Pass to ScenePush via enterSfx prop.
export const TRANSITION_SFX: SFXEntry = {
  src: "sfx/transitions/whoosh.mp3", volume: 0.35, durationInFrames: 20,
};

// Available SFX library — use in SFX_TIMELINE or scene-specific Sequence+Audio.
// These are NOT auto-played; reference them when you need manual control.
export const SFX = {
  click:        { src: "sfx/ui/click.mp3", volume: 0.4, durationInFrames: 15 },
  notification: { src: "sfx/ui/notification.mp3", volume: 0.35, durationInFrames: 45 },
  pop:          { src: "sfx/ui/pop.mp3", volume: 0.3, durationInFrames: 30 },
  typing:       { src: "sfx/ui/typing.mp3", volume: 0.25, durationInFrames: 90 },
  whoosh:       { src: "sfx/transitions/whoosh.mp3", volume: 0.35, durationInFrames: 20 },
  impact:       { src: "sfx/transitions/impact.mp3", volume: 0.4, durationInFrames: 40 },
  boom:         { src: "sfx/transitions/boom.mp3", volume: 0.3, durationInFrames: 60 },
} as const satisfies Record<string, SFXEntry>;

// Manual SFX timeline — for sounds not tied to cursor actions or transitions.
export const SFX_TIMELINE: AudioCue[] = [];
