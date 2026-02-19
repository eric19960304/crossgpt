import { useMemo } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { collectModelsWithDefaultModel } from "./model";

export function useAllModels() {
  const accessStore = useAccessStore();
  const configStore = useAppConfig();
  const models = useMemo(() => {
    // Prefer models from MongoDB (dbModels); fall back to hardcoded DEFAULT_MODELS
    const baseModels =
      accessStore.dbModels.length > 0
        ? accessStore.dbModels
        : configStore.models;
    return collectModelsWithDefaultModel(
      baseModels,
      [configStore.customModels, accessStore.customModels].join(","),
      accessStore.defaultModel,
    );
  }, [
    accessStore.dbModels,
    accessStore.customModels,
    accessStore.defaultModel,
    configStore.customModels,
    configStore.models,
  ]);

  return models;
}
