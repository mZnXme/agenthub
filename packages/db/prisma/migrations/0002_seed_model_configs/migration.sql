INSERT INTO "model_configs" ("id", "name", "contextLimit", "compactAt", "createdAt") VALUES
  ('model-anthropic-claude-sonnet-4', 'anthropic/claude-sonnet-4-20250514', 200000, 0.8, CURRENT_TIMESTAMP),
  ('model-anthropic-claude-opus-4', 'anthropic/claude-opus-4-20250514', 200000, 0.8, CURRENT_TIMESTAMP),
  ('model-openai-gpt-4-1', 'openai/gpt-4.1', 1047576, 0.8, CURRENT_TIMESTAMP),
  ('model-openai-gpt-4-1-mini', 'openai/gpt-4.1-mini', 1047576, 0.8, CURRENT_TIMESTAMP),
  ('model-google-gemini-2-5-pro', 'google/gemini-2.5-pro', 1048576, 0.8, CURRENT_TIMESTAMP),
  ('model-google-gemini-2-5-flash', 'google/gemini-2.5-flash', 1048576, 0.8, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
  "contextLimit" = EXCLUDED."contextLimit",
  "compactAt" = EXCLUDED."compactAt";
