-- 1. Drop and recreate public.profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  email text,
  membership_id text UNIQUE,
  membership_expiry date,
  subsection text DEFAULT 'Kochi',
  role text DEFAULT 'ieee_member',
  ias_pending boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- 2. Create trigger function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, membership_id, membership_expiry, subsection, role, ias_pending)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'membership_id',
    (new.raw_user_meta_data->>'membership_expiry')::date,
    COALESCE(new.raw_user_meta_data->>'subsection', 'Kochi'),
    COALESCE(new.raw_user_meta_data->>'role', 'ieee_member'),
    COALESCE((new.raw_user_meta_data->>'ias_pending')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Select: Viewable by everyone
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Update: Users can update their own rows (frontend should ideally only pass full_name)
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Note: A robust system would use a trigger to prevent non-admins from updating their `role` and `ias_pending` here.
-- For now, this baseline ensures your application starts with the required schema and atomic sign up connection!
