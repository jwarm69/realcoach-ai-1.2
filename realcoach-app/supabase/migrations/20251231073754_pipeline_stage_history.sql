-- Pipeline Stage History table
CREATE TABLE pipeline_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  previous_stage pipeline_stage NOT NULL,
  new_stage pipeline_stage NOT NULL,
  change_reason TEXT,
  change_source TEXT DEFAULT 'system',
  confidence INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipeline_history_contact_id ON pipeline_stage_history(contact_id);
CREATE INDEX idx_pipeline_history_created_at ON pipeline_stage_history(created_at DESC);

ALTER TABLE pipeline_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pipeline history for their contacts"
  ON pipeline_stage_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = pipeline_stage_history.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pipeline history for their contacts"
  ON pipeline_stage_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = pipeline_stage_history.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pipeline history for their contacts"
  ON pipeline_stage_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = pipeline_stage_history.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pipeline history for their contacts"
  ON pipeline_stage_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = pipeline_stage_history.contact_id
      AND contacts.user_id = auth.uid()
    )
  );
