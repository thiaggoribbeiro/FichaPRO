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
-- 2. Ensure pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 3. Update Thiago Ribeiro to Administrador (Fixed)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "Administrador", "full_name": "Thiago Ribeiro"}'::jsonb
WHERE email = 'thiago.ribeiro@avesta.com.br';
UPDATE public.profiles
SET role = 'Administrador'
WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE email = 'thiago.ribeiro@avesta.com.br'
    );
-- 4. Create and Configure Luiz Barbosa as Gestor
INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    )
SELECT '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'luiz.neto@parvi.com.br',
    crypt('Avesta2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Luiz Barbosa", "role": "Gestor"}',
    now(),
    now()
WHERE NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE email = 'luiz.neto@parvi.com.br'
    );
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "Gestor"}'::jsonb
WHERE email = 'luiz.neto@parvi.com.br';
UPDATE public.profiles
SET role = 'Gestor',
    force_password_change = TRUE
WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE email = 'luiz.neto@parvi.com.br'
    );
-- 5. Create and Configure Rodrigo Leite as Gestor
INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    )
SELECT '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'rodrigo.leite@parvi.com.br',
    crypt('Avesta2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rodrigo Leite", "role": "Gestor"}',
    now(),
    now()
WHERE NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE email = 'rodrigo.leite@parvi.com.br'
    );
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "Gestor"}'::jsonb
WHERE email = 'rodrigo.leite@parvi.com.br';
UPDATE public.profiles
SET role = 'Gestor',
    force_password_change = TRUE
WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE email = 'rodrigo.leite@parvi.com.br'
    );