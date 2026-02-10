-- Invite System Schema for CirQL (Clubhouse-style)
-- Run this in Supabase SQL Editor

-- Invites table
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,  -- 초대 코드 (예: "CIRQL-ABC123")
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL = seed code (최초 시드 코드)
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- 사용한 유저
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ  -- 만료 날짜 (옵션)
);

-- User invites tracking (각 유저가 생성할 수 있는 초대 코드 제한)
CREATE TABLE user_invite_quota (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_invites INT DEFAULT 3,  -- 전체 생성 가능한 초대 코드 수
  used_invites INT DEFAULT 0,   -- 이미 사용된 초대 코드 수
  remaining_invites INT DEFAULT 3,  -- 남은 초대 코드 수
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_created_by ON invites(created_by);
CREATE INDEX idx_invites_used_by ON invites(used_by);
CREATE INDEX idx_invites_is_used ON invites(is_used);

-- RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_quota ENABLE ROW LEVEL SECURITY;

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

-- Function: Create initial invite quota for new user
CREATE OR REPLACE FUNCTION create_user_invite_quota()
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
CREATE OR REPLACE FUNCTION mark_invite_used(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Check if invite exists and is not used
  SELECT * INTO invite_record FROM invites WHERE code = invite_code AND is_used = FALSE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark invite as used
  UPDATE invites 
  SET is_used = TRUE, used_by = user_id, used_at = NOW()
  WHERE code = invite_code;
  
  -- Update creator's quota (if not a seed code)
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
