# CirQL App Store 준비 가이드

## 📋 개요

Clubhouse 스타일의 초대 시스템을 구현하고 데이터베이스를 초기화하여 App Store 출시를 준비합니다.

---

## 🎯 구현된 기능

### 1. 초대 시스템 (Clubhouse-style)
- ✅ 모든 회원가입에 초대 코드 필수
- ✅ 각 유저는 3개의 초대 코드 할당
- ✅ 초대 코드 사용 시 자동으로 쿼터 차감
- ✅ 시드 코드 (재키님용 10개)
- ✅ 초대 코드 생성 및 관리 페이지

### 2. 데이터베이스 구조
- **invites** - 초대 코드 관리
- **user_invite_quota** - 유저별 초대 할당량
- **Functions**:
  - `create_user_invite_quota()` - 신규 유저 자동 할당
  - `mark_invite_used()` - 초대 코드 사용 처리

### 3. 수정된 페이지
- `/signup` - 초대 코드 입력 필수
- `/invites` (신규) - 초대 코드 생성/관리

---

## 🚀 실행 단계

### Step 1: Supabase SQL 스크립트 실행

**⚠️ 주의: 이 작업은 모든 데이터를 삭제합니다!**

1. Supabase 대시보드 접속: https://supabase.com/dashboard/project/yliczwrnmiwewbcythdn
2. 좌측 메뉴에서 `SQL Editor` 클릭
3. `New query` 클릭
4. 아래 파일의 내용을 복사하여 붙여넣기:
   ```
   /Users/pc/.openclaw/workspace/oodly/supabase/reset-and-init.sql
   ```
5. `Run` 버튼 클릭
6. 완료 메시지 확인:
   - "Database reset complete!"
   - "Total seed invite codes created: 10"

### Step 2: 코드 배포

```bash
cd /Users/pc/.openclaw/workspace/oodly
git add .
git commit -m "Add Clubhouse-style invite system for App Store"
git push
```

Vercel이 자동으로 배포합니다 (약 2-3분 소요).

### Step 3: 초대 코드 확인

SQL Editor에서 실행:
```sql
SELECT code, is_used FROM invites WHERE created_by IS NULL ORDER BY code;
```

**재키님용 시드 코드 (10개):**
- CIRQL-JACKIE-01
- CIRQL-JACKIE-02
- CIRQL-JACKIE-03
- CIRQL-JACKIE-04
- CIRQL-JACKIE-05
- CIRQL-JACKIE-06
- CIRQL-JACKIE-07
- CIRQL-JACKIE-08
- CIRQL-JACKIE-09
- CIRQL-JACKIE-10

### Step 4: 테스트

1. **회원가입 테스트**
   - https://oodly-app.vercel.app/signup 접속
   - 초대 코드 입력: `CIRQL-JACKIE-01`
   - 회원가입 진행
   - 성공 시 `/feed`로 리다이렉트

2. **초대 코드 생성 테스트**
   - 로그인 후 `/invites` 접속
   - "새 초대 코드 만들기" 클릭
   - 코드 생성 확인 (남은 개수: 3 → 2)

3. **초대 코드 사용 테스트**
   - 로그아웃
   - 새 계정으로 생성한 코드 사용
   - 성공 시 원래 계정 `/invites`에서 "사용됨" 표시 확인

---

## 📊 데이터베이스 스키마

### invites 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| code | TEXT | 초대 코드 (UNIQUE) |
| created_by | UUID | 생성자 (NULL = 시드 코드) |
| used_by | UUID | 사용자 |
| is_used | BOOLEAN | 사용 여부 |
| used_at | TIMESTAMPTZ | 사용 시각 |
| created_at | TIMESTAMPTZ | 생성 시각 |
| expires_at | TIMESTAMPTZ | 만료일 (옵션) |

### user_invite_quota 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | UUID | Primary Key |
| total_invites | INT | 전체 할당량 (기본: 3) |
| used_invites | INT | 사용된 개수 |
| remaining_invites | INT | 남은 개수 |
| updated_at | TIMESTAMPTZ | 마지막 업데이트 |

---

## 🔐 보안

### Row Level Security (RLS) 정책
- ✅ 누구나 초대 코드 존재 확인 가능 (회원가입용)
- ✅ 유저는 자신의 쿼터 내에서만 생성 가능
- ✅ 유저는 자신의 초대 코드만 조회 가능

### Functions
- `create_user_invite_quota()` - SECURITY DEFINER (자동 트리거)
- `mark_invite_used()` - SECURITY DEFINER (RPC 호출)

---

## 🎨 UI/UX

### 회원가입 페이지 변경사항
- 초대 코드 입력란 최상단 배치 (필수)
- "Cirql은 초대제로 운영됩니다" 안내 문구
- 대문자 자동 변환 (입력 편의성)
- 에러 메시지:
  - "유효하지 않은 초대 코드입니다"
  - "이미 사용된 초대 코드입니다"

### 초대 관리 페이지 (/invites)
- 남은 초대 코드 개수 표시
- 초대 코드 생성 버튼
- 생성한 초대 코드 목록
- 사용 여부 및 날짜 표시
- 복사 버튼 (미사용 코드만)

---

## 📱 App Store 제출 준비

### 완료 항목
- [x] 초대 시스템 구현
- [x] 데이터 초기화 스크립트
- [x] 회원가입 플로우 수정
- [x] 초대 관리 페이지 추가

### 다음 단계 (App Store 제출용)
- [ ] 앱 아이콘 제작
- [ ] 스크린샷 준비 (6.5", 5.5")
- [ ] 앱 설명 작성
- [ ] 개인정보 처리방침 URL
- [ ] 서비스 약관 URL
- [ ] 카테고리 선택 (Social Networking)
- [ ] 연령 등급 설정

---

## 🛠️ 트러블슈팅

### 문제: 초대 코드 생성 안 됨
**원인**: user_invite_quota가 없음  
**해결**: SQL 실행
```sql
INSERT INTO user_invite_quota (user_id, total_invites, used_invites, remaining_invites)
SELECT id, 3, 0, 3 FROM users WHERE id NOT IN (SELECT user_id FROM user_invite_quota);
```

### 문제: 시드 코드가 작동 안 함
**원인**: reset-and-init.sql 미실행  
**해결**: Step 1 다시 실행

### 문제: RLS 정책 에러
**원인**: 정책 중복  
**해결**: SQL 실행
```sql
DROP POLICY IF EXISTS "정책이름" ON 테이블명;
```

---

## 📞 지원

문제 발생 시:
1. Supabase SQL Editor에서 로그 확인
2. 브라우저 콘솔 확인 (F12)
3. Henry Ford에게 문의

---

**작성일**: 2026-02-10  
**버전**: 1.0.0  
**작성자**: Henry Ford ⚙️
