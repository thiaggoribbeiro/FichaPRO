-- 1. Ensure columns exist in public.profiles
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'role'
) THEN
ALTER TABLE public.profiles
ADD COLUMN role TEXT DEFAULT 'Visitante';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'force_password_change'
) THEN
ALTER TABLE public.profiles
ADD COLUMN force_password_change BOOLEAN DEFAULT FALSE;
END IF;
END $$;
-- 2. Create the requested users in auth.users
-- Note: Creating users via SQL in auth.users requires the pgcrypto extension for crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Luiz Barbosa
INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
SELECT '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'luiz.neto@parvi.com.br',
    crypt('Avesta2026', gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Luiz Barbosa", "role": "Administrador"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
WHERE NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE email = 'luiz.neto@parvi.com.br'
    );
-- Rodrigo Leite
INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
SELECT '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'rodrigo.leite@parvi.com.br',
    crypt('Avesta2026', gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rodrigo Leite", "role": "Administrador"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
WHERE NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE email = 'rodrigo.leite@parvi.com.br'
    );
-- 3. Update profiles and user_metadata for these users
-- Update Metadata in auth.users (important because the app checks user_metadata.role)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "Administrador"}'::jsonb
WHERE email IN (
        'luiz.neto@parvi.com.br',
        'rodrigo.leite@parvi.com.br'
    );
-- Update public.profiles using subquery to match ID
UPDATE public.profiles
SET role = 'Administrador',
    force_password_change = TRUE
WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE email = 'luiz.neto@parvi.com.br'
    );
UPDATE public.profiles
SET role = 'Administrador',
    force_password_change = TRUE
WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE email = 'rodrigo.leite@parvi.com.br'
    );