# Auth and Account Lifecycle Spec

## 1. Goal

Define the authentication and account lifecycle for Lumina IELTS with exactly two roles:

- `admin`
- `learner`

There is no public registration flow. The admin provisions learner accounts manually.

## 2. Roles

### 2.1 Admin

The admin can:

- Sign in to the app.
- Create learner accounts.
- View the learner account list.
- Reset a learner password.
- Disable or archive learner access if needed in the future.

The admin cannot act as a second product persona such as teacher or content reviewer. This role exists only for account management.

### 2.2 Learner

The learner can:

- Sign in with credentials provided by the admin.
- Complete onboarding.
- Use all learning features available to end users.
- Change their own password.
- Manage their personal profile settings.

The learner cannot:

- Register a new account.
- Create other learner accounts.
- Access admin account management screens.

## 3. Entry Flow

When a signed-out user enters the app:

1. The app redirects to `/auth/login`.
2. The login page is the default entry point.
3. If the user is already authenticated, the app routes them based on role and account state.

Routing rules after successful authentication:

- `admin` -> `/admin/accounts`
- `learner` with `must_change_password = true` -> `/auth/change-password`
- `learner` with missing onboarding -> `/onboarding`
- `learner` with completed onboarding -> `/`

## 4. Learner Account Provisioning

The admin creates learner accounts from the admin area.

Required inputs:

- learner full name
- learner email

System-generated values:

- temporary password
- password expiration intent via `must_change_password = true`
- account role = `learner`

Password generation requirements:

- minimum 12 characters
- at least one uppercase letter
- at least one lowercase letter
- at least one number
- at least one symbol
- no dictionary-only or trivial patterns

Provisioning outcome:

- the learner record is created
- the profile shell is created
- the admin sees the temporary credential exactly once
- the admin shares the credential with the learner out of band

## 5. First Login Flow

After the learner signs in for the first time:

1. The app detects `must_change_password = true`.
2. The learner is redirected to `/auth/change-password`.
3. The learner sees:
   - temporary password confirmation field if needed
   - new password
   - confirm new password
4. The learner can either:
   - change the password immediately
   - skip once and continue to the app

If the learner skips:

- the account stays flagged with `must_change_password = true`
- the profile settings page continues to show a password-change banner

If the learner changes the password:

- `must_change_password` becomes `false`
- `password_changed_at` is stored

## 6. Profile Settings

The learner profile settings page should support:

- display name
- target band
- current level
- focus skill
- study frequency
- password change

Password change behavior:

- available at any time
- requires current password unless the learner is in forced first-login reset flow
- updates `password_changed_at`

## 7. Data Model

Minimum auth-related fields:

### 7.1 `profiles`

- `id`
- `email`
- `full_name`
- `role`
- `created_at`
- `updated_at`

### 7.2 `user_security_settings`

- `user_id`
- `must_change_password`
- `password_changed_at`
- `created_by_admin_id`
- `temporary_password_issued_at`

### 7.3 `user_goals`

- `user_id`
- `target_band`
- `current_level`
- `focus_skill`
- `study_frequency`
- `exam_date` nullable
- `completed_onboarding`

## 8. Route Protection

Protected route groups:

- `/(app)` requires authentication
- `/admin/*` requires `role = admin`

Guard rules:

- unauthenticated user -> `/auth/login`
- learner visiting `/admin/*` -> redirect to `/`
- admin visiting learner-only onboarding routes -> redirect to `/admin/accounts`

## 9. MVP Screens

Required screens:

- `/auth/login`
- `/auth/change-password`
- `/onboarding`
- `/settings/profile`
- `/admin/accounts`
- `/admin/accounts/new`

## 10. Out of Scope

Not included in this spec:

- self-registration
- email verification flow
- forgot-password email recovery
- SSO providers
- organization or team management
- multi-admin governance

## 11. Implementation Notes

- Keep the auth experience simple because there is only one operational admin.
- Favor server-side authorization checks for all admin routes and actions.
- Treat account creation and password reset as auditable events even if the audit UI is not part of MVP.
