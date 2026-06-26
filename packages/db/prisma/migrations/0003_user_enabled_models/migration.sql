ALTER TABLE "user_model_preferences"
  ADD COLUMN "modelName" TEXT,
  ADD COLUMN "enabledModels" JSONB;
