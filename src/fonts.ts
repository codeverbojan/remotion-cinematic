import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
loadFraunces("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
loadJetBrainsMono("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

export const FONTS_LOADED = true;
