-- CirQL Database Reset & Invite System Initialization
-- ⚠️ WARNING: This will DELETE ALL DATA in the database!
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Delete all existing data
-- ============================================

-- Delete in correct order (respecting foreign keys)
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM follows;
DELETE FROM posts;
DELETE FROM users;  -- This will also trigger auth.users cascade delete

-- ============================================
-- STEP 2: Create invites tables (if not exists)
-- ============================================

-- Invites table
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ
);

-- User invites tracking
CREATE TABLE IF NOT EXISTS user_invite_quota (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_invites INT DEFAULT 3,
  used_invites INT DEFAULT 0,
  remaining_invites INT DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON invites(created_by);
CREATE INDEX IF NOT EXISTS idx_invites_used_by ON invites(used_by);
CREATE INDEX IF NOT EXISTS idx_invites_is_used ON invites(is_used);

-- RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_quota ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can check if invite code exists (for signup)" ON invites;
DROP POLICY IF EXISTS "Users can create invite codes (within quota)" ON invites;
DROP POLICY IF EXISTS "Users can view their own invites" ON invites;
DROP POLICY IF EXISTS "Users can view their own quota" ON user_invite_quota;
DROP POLICY IF EXISTS "Users can update their own quota" ON user_invite_quota;

-- Invites policies
CREATE POLICY "Anyone can check if invite code exists (for signup)" ON invites
  FOR SELECT USING (true);

CREATE POLICY "Users can create invite codes (within quota)" ON invites
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM user_invite_quota 
      WHERE user_id = auth.uid() AND remaining_invites > 0
    )
  );

CREATE POLICY "Users can view their own invites" ON invites
  FOR SELECT USING (created_by = auth.uid());

-- User invite quota policies
CREATE POLICY "Users can view their own quota" ON user_invite_quota
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own quota" ON user_invite_quota
  FOR UPDATE USING (auth.uid() = user_id);

-- Drop existing functions/triggers if any
DROP TRIGGER IF EXISTS on_user_created ON users;
DROP FUNCTION IF EXISTS create_user_invite_quota();
DROP FUNCTION IF EXISTS mark_invite_used(TEXT, UUID);

-- Function: Create initial invite quota for new user
CREATE FUNCTION create_user_invite_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_invite_quota (user_id, total_invites, used_invites, remaining_invites)
  VALUES (NEW.id, 3, 0, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create invite quota when user signs up
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_invite_quota();

-- Function: Mark invite as used and update quota
CREATE FUNCTION mark_invite_used(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record FROM invites WHERE code = invite_code AND is_used = FALSE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  UPDATE invites 
  SET is_used = TRUE, used_by = user_id, used_at = NOW()
  WHERE code = invite_code;
  
  IF invite_record.created_by IS NOT NULL THEN
    UPDATE user_invite_quota 
    SET used_invites = used_invites + 1, 
        remaining_invites = remaining_invites - 1,
        updated_at = NOW()
    WHERE user_id = invite_record.created_by;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Create seed invite codes for Jackie
-- ============================================

-- Insert 10 seed invite codes for Jackie (founder codes)
INSERT INTO invites (code, created_by, is_used) VALUES
  ('CIRQL-JACKIE-01', NULL, FALSE),
  ('CIRQL-JACKIE-02', NULL, FALSE),
  ('CIRQL-JACKIE-03', NULL, FALSE),
  ('CIRQL-JACKIE-04', NULL, FALSE),
  ('CIRQL-JACKIE-05', NULL, FALSE),
  ('CIRQL-JACKIE-06', NULL, FALSE),
  ('CIRQL-JACKIE-07', NULL, FALSE),
  ('CIRQL-JACKIE-08', NULL, FALSE),
  ('CIRQL-JACKIE-09', NULL, FALSE),
  ('CIRQL-JACKIE-10', NULL, FALSE);

-- ============================================
-- CONFIRMATION
-- ============================================

SELECT 'Database reset complete!' AS status;
SELECT 'Total seed invite codes created: ' || COUNT(*) AS invite_codes_created 
FROM invites WHERE created_by IS NULL;
