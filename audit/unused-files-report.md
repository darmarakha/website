# Unused Files Audit Report

This report identifies potentially unused files, duplicate files, and broken references across the repository. **Do not delete anything immediately** based on this report without manual review, especially files related to databases, uploads, or those that might be dynamically referenced.

## 1. Files & Folders Checked
The audit scanned for patterns like `*backup*`, `*old*`, `*temp*`, `*test*`, and extensions like `.bak`, `.tmp`, `.old`.
Total files in codebase (excluding ignored directories): ~260.

## 2. Ignored Folders (Not deeply scanned)
- `.git/`
- `.jules/`
- `node_modules/`
- `vendor/`
- `.cache/`
- `.tmp/`

## 3. Protected Folders (Uploads/Runtime)
Files in these folders were not flagged for deletion even if they looked unused.
- `edit/uploads/`
- `edit/project-files/`
- `asset/akun/`
- `uploads/`
- `cache/`
- `logs/`
- `AI/backups/` (AI backup engine folder)

## 4. Safe-to-Delete Candidates
*Based on our scan, the following files match temporary/backup patterns, show zero references in the source code, and are not in protected folders. However, due to the nature of dynamic PHP sites, please review manually.*

- `AI/test_api.php`
  - **Reason:** Test file pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm AI/test_api.php`

- `Belajar/Bahasa-Jepang/N5/fix-readings.cjs`
  - **Reason:** "fix" script pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Belajar/Bahasa-Jepang/N5/fix-readings.cjs`

- `Belajar/Bahasa-Jepang/N5/fix-readings.js`
  - **Reason:** "fix" script pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Belajar/Bahasa-Jepang/N5/fix-readings.js`

- `Belajar/Bahasa-Jepang/N5/test-urls.cjs`
  - **Reason:** Test script pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Belajar/Bahasa-Jepang/N5/test-urls.cjs`

- `Belajar/Bahasa-Jepang/N5/test-urls2.cjs`
  - **Reason:** Test script pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Belajar/Bahasa-Jepang/N5/test-urls2.cjs`

- `Belajar/Bahasa-Jepang/N5/test-urls3.cjs`
  - **Reason:** Test script pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Belajar/Bahasa-Jepang/N5/test-urls3.cjs`

- `Belajar/Bahasa-Jepang/N5/test_tts.ts`
  - **Reason:** Test script pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Belajar/Bahasa-Jepang/N5/test_tts.ts`

- `Belajar/Bahasa-Jepang/N5/test_tts2.ts`
  - **Reason:** Test script pattern.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Belajar/Bahasa-Jepang/N5/test_tts2.ts`

- `Game/DnD-2014/README_FIX_SKILL_PROFICIENCY_V30.txt`
  - **Reason:** Old fix notes, text file.
  - **References:** None.
  - **Risk:** Low.
  - **Recommendation:** `git rm Game/DnD-2014/README_FIX_SKILL_PROFICIENCY_V30.txt`

## 5. Probably Unused But Needs Review
*These files matched patterns but are referenced locally or might serve some obscure role.*

- `Game/DnD-2014/README_FIX_LOBBY_V37.txt`
  - **Reason:** Listed in `Game/DnD-2014/PATCH_PATHS.txt`.
  - **Risk:** Medium.

- `tests/run.php`
  - **Reason:** Testing script. It works and is referenced in documentation.
  - **Risk:** Medium.

## 6. Unknown / Database-Risk Files
*Do not delete these without checking database records! Provide safe SQL checks if needed.*

- `edit/uploads/1777173612_WhatsAppImage20260426at09.59.27.jpeg`
  - Has a duplicate, but might be linked in the DB.
- `edit/photo/darma.jpeg`
  - Has a duplicate.

### Recommended Safe Database Checks:
Run these queries manually in your MySQL terminal to verify which paths are active:
```sql
SELECT avatar_path FROM users WHERE avatar_path IS NOT NULL;
SELECT avatar FROM users WHERE avatar IS NOT NULL;
SELECT foto FROM users WHERE foto IS NOT NULL;
SELECT photo FROM users WHERE photo IS NOT NULL;
SELECT image FROM projects WHERE image IS NOT NULL;
SELECT file_url FROM projects WHERE file_url IS NOT NULL;
SELECT cert_image FROM users WHERE cert_image IS NOT NULL;
```

## 7. Duplicate Files
*Identical file contents found. One could potentially be removed if the system relies on the other.*

- `Game/DnD-2014/PATCH_NOTES_v35.txt` == `Game/PATCH_NOTES_v35.txt`
- `Belajar/Bahasa-Jepang/assets/index.css` == `Belajar/Bahasa-Jepang/assets/index.js` *(Warning: JS file has CSS content)*
- `edit/uploads/.htaccess` == `Bisnis/edit/uploads/.htaccess`
- `logout.php` == `sabila/logout.php`
- `AI/activity-log.json` == `Belajar/leaderboard.json` *(Empty or default JSON structure)*
- `AI/file-brain-index.json` == `AI/owner-chat.json` == `AI/owner-tasks.json` *(Empty or default JSON structure)*
- `edit/photo/darma.jpeg` == `edit/uploads/1777173612_WhatsAppImage20260426at09.59.27.jpeg`
- `AI/backups/.htaccess` == `AI/file-brain/.htaccess`

## 8. Broken References (Missing Files)
*These files are referenced in the code (HTML/JS/PHP) but could not be found locally.*

- `../../bahasa-jepang/` (Referenced in `Game/DnD-2014/index.php`)
- `/assets/index-KgEiz027.js` (Referenced in `Belajar/Bahasa-Jepang/N5/dist/index.html`)

## 9. Suggested Next Actions
1. Review the "Safe-to-Delete Candidates". If you approve, you can execute the provided `git rm` commands.
2. Run the safe database queries to check for upload file usage.
3. Fix the broken references if they affect production.
