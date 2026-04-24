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
        defaultProps={{"brand":{"name":"Product","colors":{"primary":"#6366F1","accent":"#22D3EE","background":"#0F0F14","backgroundLight":"#1A1A24","surface":"#24243A","text":"#F5F5FF","textMuted":"#A0A0C0","success":"#34D399","warning":"#FBBF24","error":"#F87171"},"fontSans":"Inter","fontSerif":"Fraunces","fontMono":"JetBrains Mono"},"headlines":{"pain":["Where did that","request go?"],"resolution":["Every request.","Tracked."],"closer":["Try it free."]},"cta":"Try it free","productFeatures":[{"title":"Dashboard","description":"Live metrics and KPIs at a glance"},{"title":"Request Manager","description":"Track every request from submission to delivery"},{"title":"Smart Alerts","description":"Get notified when things need attention"}],"scenes":[{"id":"chaos","enabled":true,"durationInFrames":260,"enterFrom":"none" as const,"exitTo":"top" as const,"background":"dark" as const},{"id":"product-reveal","enabled":true,"durationInFrames":150,"enterFrom":"bottom" as const,"exitTo":"right" as const,"background":"dark" as const},{"id":"feature-showcase","enabled":true,"durationInFrames":200,"enterFrom":"left" as const,"exitTo":"top" as const,"background":"dark" as const},{"id":"headline-resolution","enabled":true,"durationInFrames":120,"enterFrom":"bottom" as const,"exitTo":"top" as const,"background":"gradient" as const},{"id":"closer","enabled":true,"durationInFrames":90,"enterFrom":"bottom" as const,"exitTo":"none" as const,"background":"light" as const}],"overlap":15,"easing":"snappy" as const,"windowLayout":[{"id":"spreadsheet","startX":500,"startY":30,"startW":1100,"startH":500,"endX":1450,"endY":-200,"enterAt":5,"enterDuration":14,"enterFrom":"scale" as const,"animateAt":150,"animateDuration":25,"exitDuration":12,"zIndex":1,"title":"Tracking Sheet"},{"id":"email","startX":20,"startY":200,"startW":1020,"startH":400,"endX":-680,"endY":400,"enterAt":30,"enterDuration":14,"enterFrom":"scale" as const,"animateAt":150,"animateDuration":25,"exitDuration":12,"zIndex":2,"title":"Email — Q2 Requests"},{"id":"chat","startX":583,"startY":492,"startW":1147,"startH":487,"endX":1332,"endY":978,"enterAt":60,"enterDuration":14,"enterFrom":"scale" as const,"animateAt":150,"animateDuration":25,"exitDuration":12,"zIndex":3,"title":"Team Chat","endW":1200,"endH":500},{"id":"product-window","startX":30,"startY":30,"startW":1860,"startH":1020,"endX":980,"endY":500,"endW":960,"endH":600,"enterAt":0,"enterDuration":1,"enterFrom":"fade" as const,"animateAt":30,"animateDuration":18,"exitDuration":12,"zIndex":1,"title":"Dashboard — Overview"},{"id":"top-panel","startX":354,"startY":193,"startW":920,"startH":440,"enterAt":48,"enterDuration":10,"enterFrom":"slide-up" as const,"animateDuration":18,"exitDuration":12,"zIndex":2,"title":"Request Manager"},{"id":"left-panel","startX":510,"startY":422,"startW":920,"startH":570,"enterAt":53,"enterDuration":10,"enterFrom":"slide-up" as const,"animateDuration":18,"exitDuration":12,"zIndex":3,"title":"Smart Alerts"},{"id":"feature-0","startX":30,"startY":30,"startW":800,"startH":500,"enterAt":0,"enterDuration":12,"enterFrom":"scale" as const,"animateDuration":18,"exitDuration":12,"zIndex":1,"title":"Dashboard"},{"id":"feature-1","startX":990,"startY":30,"startW":800,"startH":500,"enterAt":35,"enterDuration":12,"enterFrom":"scale" as const,"animateDuration":18,"exitDuration":12,"zIndex":2,"title":"Request Manager"},{"id":"feature-2","startX":30,"startY":30,"startW":1400,"startH":700,"enterAt":70,"enterDuration":12,"enterFrom":"scale" as const,"animateDuration":18,"exitDuration":12,"zIndex":3,"title":"Smart Alerts"}],"cursorPath":[],"appDescriptor":{"layout":"sidebar" as const,"sidebar":{"width":220,"items":[{"label":"Dashboard","icon":"📊","active":true},{"label":"Orders","icon":"📦","active":false,"badge":"3"},{"label":"Analytics","icon":"📈","active":false},{"label":"Settings","icon":"⚙","active":false}],"avatar":{"name":"Alex Chen"}},"topBar":{"title":"Dashboard","search":true,"searchPlaceholder":"Search...","tabs":[{"label":"Overview","active":true},{"label":"Details","active":false},{"label":"History","active":false}],"actions":[{"label":"New Order","variant":"primary" as const}]},"content":{"columnCount":3,"gap":16,"panels":[{"type":"stat" as const,"title":"Revenue","label":"Revenue","value":"$12,400","delta":"+12%","messageVariant":"chat" as const},{"type":"stat" as const,"title":"Orders","label":"Orders","value":"342","delta":"+8%","messageVariant":"chat" as const},{"type":"stat" as const,"title":"Customers","label":"Customers","value":"1,205","delta":"+3%","messageVariant":"chat" as const},{"type":"table" as const,"title":"Recent Orders","columns":["Name","Status","Amount"],"rows":[["Alex Chen","Shipped","$2,400"],["Jordan Lee","Pending","$1,800"],["Sam Park","Delivered","$950"]],"statusColumn":1,"messageVariant":"chat" as const},{"type":"list" as const,"title":"Quick Actions","items":[{"label":"API Keys","description":"Manage access tokens"},{"label":"Webhooks","description":"Configure event hooks","badge":"2"},{"label":"Billing","description":"View invoices and plans"}],"messageVariant":"chat" as const},{"type":"placeholder" as const,"title":"Chart","messageVariant":"chat" as const,"height":200}]}},"music":{"enabled":true,"volume":0.35,"fadeInFrames":45,"fadeOutFrames":90},"sfxEnabled":true,"sfxVolume":0.4}}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
