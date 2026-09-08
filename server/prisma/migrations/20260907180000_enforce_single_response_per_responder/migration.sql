-- CreateIndex
-- One response per survey per responder when allowMultipleResponses=false.
-- Rows with NULL responderKey (allowMultipleResponses=true) do not conflict
-- because NULLs are distinct in PostgreSQL unique indexes.
CREATE UNIQUE INDEX "Response_surveyId_responderKey_key" ON "Response"("surveyId", "responderKey");