import { outputSize } from "./canvas";
import React from "react";
import { Composition } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { CANVAS } from "./tokens";
import { CinematicDemo } from "./CinematicDemo";
import { CinematicSchema } from "./schema";
import type { CinematicProps } from "./schema";

export function calculateDuration(props: CinematicProps): number {
  const enabled = props.scenes.filter((s) => s.enabled);
  if (enabled.length === 0) return 30;
  const total = enabled.reduce((sum, s) => sum + s.durationInFrames, 0);
  return total - props.overlap * Math.max(0, enabled.length - 1);
}

const calculateMetadata: CalculateMetadataFunction<CinematicProps> = ({
  props,
}) => {
  return {
    durationInFrames: calculateDuration(props),
    ...outputSize(props.outputFormat),
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CinematicDemo"
        component={CinematicDemo}
        durationInFrames={760}
        fps={30}
        width={CANVAS.width}
        height={CANVAS.height}
        schema={CinematicSchema}
        defaultProps={{
  "outputFormat": "landscape",
  "layoutCanvas": {
    "width": 1920,
    "height": 1080
  },
  "brand": {
    "name": "Product",
    "colors": {
      "primary": "#6366F1",
      "accent": "#22D3EE",
      "background": "#0F0F14",
      "backgroundLight": "#1A1A24",
      "surface": "#24243A",
      "text": "#F5F5FF",
      "textMuted": "#A0A0C0",
      "success": "#34D399",
      "warning": "#FBBF24",
      "error": "#F87171"
    },
    "fontSans": "Inter",
    "fontSerif": "Fraunces",
    "fontMono": "JetBrains Mono"
  },
  "headlines": {
    "pain": [
      "Where did that",
      "request go?"
    ],
    "resolution": [
      "Every request.",
      "Tracked."
    ],
    "closer": [
      "Try it free."
    ]
  },
  "cta": "Try it free",
  "productFeatures": [
    {
      "title": "Dashboard",
      "description": "Live metrics and KPIs at a glance"
    },
    {
      "title": "Request Manager",
      "description": "Track every request from submission to delivery"
    },
    {
      "title": "Smart Alerts",
      "description": "Get notified when things need attention"
    }
  ],
  "scenes": [
    {
      "id": "chaos",
      "enabled": true,
      "durationInFrames": 260,
      "enterFrom": "none",
      "exitTo": "top",
      "background": "dark"
    },
    {
      "id": "product-reveal",
      "enabled": true,
      "durationInFrames": 150,
      "enterFrom": "bottom",
      "exitTo": "right",
      "background": "dark"
    },
    {
      "id": "feature-showcase",
      "enabled": true,
      "durationInFrames": 200,
      "enterFrom": "left",
      "exitTo": "top",
      "background": "dark"
    },
    {
      "id": "headline-resolution",
      "enabled": true,
      "durationInFrames": 120,
      "enterFrom": "bottom",
      "exitTo": "top",
      "background": "gradient"
    },
    {
      "id": "closer",
      "enabled": true,
      "durationInFrames": 90,
      "enterFrom": "bottom",
      "exitTo": "none",
      "background": "light"
    }
  ],
  "overlap": 15,
  "easing": "snappy",
  "windowLayout": [
    {
      "id": "spreadsheet",
      "startX": 500,
      "startY": 30,
      "startW": 1100,
      "startH": 500,
      "endX": 1450,
      "endY": -200,
      "enterAt": 5,
      "enterDuration": 14,
      "enterFrom": "scale",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 1,
      "title": "Tracking Sheet"
    },
    {
      "id": "email",
      "startX": 20,
      "startY": 200,
      "startW": 1020,
      "startH": 400,
      "endX": -680,
      "endY": 400,
      "enterAt": 30,
      "enterDuration": 14,
      "enterFrom": "scale",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 2,
      "title": "Email — Q2 Requests"
    },
    {
      "id": "chat",
      "startX": 208,
      "startY": 400,
      "startW": 1200,
      "startH": 500,
      "endX": 900,
      "endY": 850,
      "enterAt": 60,
      "enterDuration": 14,
      "enterFrom": "scale",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 3,
      "title": "Team Chat"
    },
    {
      "id": "sticky-0",
      "startX": 30,
      "startY": 20,
      "startW": 200,
      "startH": 160,
      "endX": -100,
      "endY": -180,
      "enterAt": 0,
      "enterDuration": 12,
      "enterFrom": "scale",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 0,
      "rotation": -3,
      "title": "Sticky Note"
    },
    {
      "id": "sticky-1",
      "startX": 260,
      "startY": 35,
      "startW": 200,
      "startH": 160,
      "endX": 60,
      "endY": -200,
      "enterAt": 8,
      "enterDuration": 12,
      "enterFrom": "scale",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 0,
      "rotation": 2.5,
      "title": "Sticky Note"
    },
    {
      "id": "sticky-2",
      "startX": 140,
      "startY": 190,
      "startW": 200,
      "startH": 160,
      "endX": -60,
      "endY": -160,
      "enterAt": 16,
      "enterDuration": 12,
      "enterFrom": "scale",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 0,
      "rotation": -4,
      "title": "Sticky Note"
    },
    {
      "id": "notification-0",
      "startX": 1530,
      "startY": 30,
      "startW": 360,
      "startH": 80,
      "endX": 2030,
      "enterAt": 90,
      "enterDuration": 10,
      "enterFrom": "slide-right",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 10,
      "title": "Notification"
    },
    {
      "id": "notification-1",
      "startX": 1530,
      "startY": 132,
      "startW": 360,
      "startH": 80,
      "endX": 2030,
      "enterAt": 104,
      "enterDuration": 10,
      "enterFrom": "slide-right",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 10,
      "title": "Notification"
    },
    {
      "id": "notification-2",
      "startX": 1530,
      "startY": 234,
      "startW": 360,
      "startH": 80,
      "endX": 2030,
      "enterAt": 118,
      "enterDuration": 10,
      "enterFrom": "slide-right",
      "animateAt": 150,
      "animateDuration": 25,
      "exitDuration": 12,
      "zIndex": 10,
      "title": "Notification"
    },
    {
      "id": "product-window",
      "startX": 192,
      "startY": 40,
      "startW": 1536,
      "startH": 1000,
      "endX": 72,
      "endY": 160,
      "endW": 1152,
      "endH": 762,
      "enterAt": 0,
      "enterDuration": 1,
      "enterFrom": "fade",
      "animateAt": 30,
      "animateDuration": 18,
      "exitDuration": 12,
      "zIndex": 1,
      "title": "Dashboard — Overview"
    },
    {
      "id": "top-panel",
      "startX": 1290,
      "startY": 80,
      "startW": 560,
      "startH": 440,
      "enterAt": 48,
      "enterDuration": 10,
      "enterFrom": "slide-up",
      "animateDuration": 18,
      "exitDuration": 12,
      "zIndex": 2,
      "title": "Request Manager"
    },
    {
      "id": "left-panel",
      "startX": 1290,
      "startY": 560,
      "startW": 560,
      "startH": 440,
      "enterAt": 53,
      "enterDuration": 10,
      "enterFrom": "slide-up",
      "animateDuration": 18,
      "exitDuration": 12,
      "zIndex": 3,
      "title": "Smart Alerts"
    },
    {
      "id": "feature-0",
      "startX": 30,
      "startY": 30,
      "startW": 800,
      "startH": 500,
      "enterAt": 0,
      "enterDuration": 12,
      "enterFrom": "scale",
      "animateDuration": 18,
      "exitDuration": 12,
      "zIndex": 1,
      "title": "Dashboard"
    },
    {
      "id": "feature-1",
      "startX": 990,
      "startY": 30,
      "startW": 800,
      "startH": 500,
      "enterAt": 35,
      "enterDuration": 12,
      "enterFrom": "scale",
      "animateDuration": 18,
      "exitDuration": 12,
      "zIndex": 2,
      "title": "Request Manager"
    },
    {
      "id": "feature-2",
      "startX": 30,
      "startY": 30,
      "startW": 1400,
      "startH": 700,
      "enterAt": 70,
      "enterDuration": 12,
      "enterFrom": "scale",
      "animateDuration": 18,
      "exitDuration": 12,
      "zIndex": 3,
      "title": "Smart Alerts"
    }
  ],
  "cursorPath": [
    {
      "sceneId": "chaos",
      "at": 0,
      "action": "idle",
      "positionX": 1400,
      "positionY": 300,
      "anchor": "center"
    },
    {
      "sceneId": "chaos",
      "at": 10,
      "action": "moveTo",
      "target": "spreadsheet",
      "anchor": "center",
      "anchorXPct": 60,
      "anchorYPct": 40,
      "duration": 12
    },
    {
      "sceneId": "chaos",
      "at": 26,
      "action": "click",
      "target": "spreadsheet",
      "anchor": "center"
    },
    {
      "sceneId": "chaos",
      "at": 34,
      "action": "moveTo",
      "target": "email",
      "anchor": "top-bar",
      "duration": 12
    },
    {
      "sceneId": "chaos",
      "at": 50,
      "action": "click",
      "target": "email",
      "anchor": "center"
    },
    {
      "sceneId": "chaos",
      "at": 58,
      "action": "moveTo",
      "target": "chat",
      "anchor": "center",
      "anchorXPct": 40,
      "anchorYPct": 30,
      "duration": 12
    },
    {
      "sceneId": "chaos",
      "at": 76,
      "action": "click",
      "target": "chat",
      "anchor": "center"
    },
    {
      "sceneId": "chaos",
      "at": 84,
      "action": "moveTo",
      "target": "notification-0",
      "anchor": "center",
      "duration": 12
    },
    {
      "sceneId": "chaos",
      "at": 100,
      "action": "click",
      "target": "notification-0",
      "anchor": "center"
    },
    {
      "sceneId": "chaos",
      "at": 108,
      "action": "moveTo",
      "target": "notification-1",
      "anchor": "center",
      "duration": 10
    },
    {
      "sceneId": "chaos",
      "at": 122,
      "action": "click",
      "target": "notification-1",
      "anchor": "center"
    },
    {
      "sceneId": "product-reveal",
      "at": 0,
      "action": "idle",
      "positionX": 200,
      "positionY": 180,
      "anchor": "center"
    },
    {
      "sceneId": "product-reveal",
      "at": 5,
      "action": "moveTo",
      "target": "product-window",
      "anchor": "corner-top-left",
      "duration": 12
    },
    {
      "sceneId": "product-reveal",
      "at": 20,
      "action": "click",
      "target": "product-window",
      "anchor": "corner-top-left"
    },
    {
      "sceneId": "product-reveal",
      "at": 30,
      "action": "drag",
      "target": "product-window",
      "anchor": "corner-top-left",
      "toX": 72,
      "toY": 160,
      "duration": 18
    },
    {
      "sceneId": "product-reveal",
      "at": 58,
      "action": "moveTo",
      "target": "top-panel",
      "anchor": "center",
      "anchorXPct": 50,
      "anchorYPct": 40,
      "duration": 12
    },
    {
      "sceneId": "product-reveal",
      "at": 74,
      "action": "click",
      "target": "top-panel",
      "anchor": "center"
    },
    {
      "sceneId": "product-reveal",
      "at": 84,
      "action": "moveTo",
      "target": "left-panel",
      "anchor": "center",
      "anchorXPct": 50,
      "anchorYPct": 40,
      "duration": 12
    },
    {
      "sceneId": "product-reveal",
      "at": 100,
      "action": "click",
      "target": "left-panel",
      "anchor": "center"
    },
    {
      "sceneId": "feature-showcase",
      "at": 0,
      "action": "idle",
      "positionX": 300,
      "positionY": 400,
      "anchor": "center"
    },
    {
      "sceneId": "feature-showcase",
      "at": 8,
      "action": "moveTo",
      "target": "feature-0",
      "anchor": "center",
      "anchorXPct": 50,
      "anchorYPct": 35,
      "duration": 12
    },
    {
      "sceneId": "feature-showcase",
      "at": 24,
      "action": "click",
      "target": "feature-0",
      "anchor": "center"
    },
    {
      "sceneId": "feature-showcase",
      "at": 40,
      "action": "moveTo",
      "target": "feature-1",
      "anchor": "center",
      "anchorXPct": 50,
      "anchorYPct": 35,
      "duration": 12
    },
    {
      "sceneId": "feature-showcase",
      "at": 56,
      "action": "click",
      "target": "feature-1",
      "anchor": "center"
    },
    {
      "sceneId": "feature-showcase",
      "at": 78,
      "action": "moveTo",
      "target": "feature-2",
      "anchor": "center",
      "anchorXPct": 40,
      "anchorYPct": 30,
      "duration": 12
    },
    {
      "sceneId": "feature-showcase",
      "at": 94,
      "action": "click",
      "target": "feature-2",
      "anchor": "center"
    },
    {
      "sceneId": "feature-showcase",
      "at": 115,
      "action": "moveTo",
      "target": "feature-2",
      "anchor": "top-bar",
      "duration": 10
    },
    {
      "sceneId": "feature-showcase",
      "at": 130,
      "action": "click",
      "target": "feature-2",
      "anchor": "top-bar"
    }
  ],
  "cursorScale": 1,
  "cursorRotation": 0,
  "appDescriptor": {
    "layout": "sidebar",
    "sidebar": {
      "width": 220,
      "items": [
        {
          "label": "Dashboard",
          "icon": "📊",
          "active": true
        },
        {
          "label": "Orders",
          "icon": "📦",
          "active": false,
          "badge": "3"
        },
        {
          "label": "Analytics",
          "icon": "📈",
          "active": false
        },
        {
          "label": "Settings",
          "icon": "⚙",
          "active": false
        }
      ],
      "avatar": {
        "name": "Alex Chen"
      }
    },
    "topBar": {
      "title": "Dashboard",
      "search": true,
      "searchPlaceholder": "Search...",
      "tabs": [
        {
          "label": "Overview",
          "active": true
        },
        {
          "label": "Details",
          "active": false
        },
        {
          "label": "History",
          "active": false
        }
      ],
      "actions": [
        {
          "label": "New Order",
          "variant": "primary"
        }
      ]
    },
    "content": {
      "columnCount": 3,
      "gap": 16,
      "panels": [
        {
          "type": "stat",
          "title": "Revenue",
          "label": "Revenue",
          "value": "$12,400",
          "delta": "+12%",
          "messageVariant": "chat"
        },
        {
          "type": "stat",
          "title": "Orders",
          "label": "Orders",
          "value": "342",
          "delta": "+8%",
          "messageVariant": "chat"
        },
        {
          "type": "stat",
          "title": "Customers",
          "label": "Customers",
          "value": "1,205",
          "delta": "+3%",
          "messageVariant": "chat"
        },
        {
          "type": "table",
          "title": "Recent Orders",
          "columns": [
            "Name",
            "Status",
            "Amount"
          ],
          "rows": [
            [
              "Alex Chen",
              "Shipped",
              "$2,400"
            ],
            [
              "Jordan Lee",
              "Pending",
              "$1,800"
            ],
            [
              "Sam Park",
              "Delivered",
              "$950"
            ]
          ],
          "statusColumn": 1,
          "messageVariant": "chat"
        },
        {
          "type": "list",
          "title": "Quick Actions",
          "items": [
            {
              "label": "API Keys",
              "description": "Manage access tokens"
            },
            {
              "label": "Webhooks",
              "description": "Configure event hooks",
              "badge": "2"
            },
            {
              "label": "Billing",
              "description": "View invoices and plans"
            }
          ],
          "messageVariant": "chat"
        },
        {
          "type": "list",
          "title": "Activity",
          "items": [
            {
              "label": "Order approved",
              "description": "Alex · Just now"
            },
            {
              "label": "Invoice sent",
              "description": "Sam · 5 minutes ago"
            }
          ],
          "messageVariant": "chat"
        }
      ]
    }
  },
  "music": {
    "enabled": true,
    "volume": 0.35,
    "fadeInFrames": 45,
    "fadeOutFrames": 90
  },
  "sfxEnabled": true,
  "sfxVolume": 0.4
}}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
