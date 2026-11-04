import React, { createContext, useContext } from "react";
import type { SceneConfig } from "./schema";
import { DEFAULT_SCENES } from "./sceneDefaults";
const Context = createContext<SceneConfig>(DEFAULT_SCENES[0]);
export const SceneProvider = Context.Provider;
export const useSceneConfig = () => useContext(Context);
