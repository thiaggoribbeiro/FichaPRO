-- Create system_logs table
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);
-- Enable Row Level Security
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
-- Create policies
-- 1. Administrators and Gestors can read all logs
CREATE POLICY "Admins and Gestors can read all logs" ON public.system_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND (
                    profiles.role = 'Administrador'
                    OR profiles.role = 'Gestor'
                )
        )
    );
-- 2. Users can read their own logs
CREATE POLICY "Users can read own logs" ON public.system_logs FOR
SELECT USING (auth.uid() = user_id);
-- 3. Authenticated users can insert logs (to record their actions)
CREATE POLICY "Users can insert own logs" ON public.system_logs FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs (user_id);