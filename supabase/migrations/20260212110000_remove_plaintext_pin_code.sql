-- I7: Remove plaintext pin_code column from user_profiles
-- pin_hash (bcrypt) is now the only PIN storage mechanism
-- This removes the security risk of storing PINs in cleartext

ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS pin_code;
