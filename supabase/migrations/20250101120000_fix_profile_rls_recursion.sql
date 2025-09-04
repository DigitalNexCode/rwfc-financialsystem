/*
          # [Fix] Correct RLS Policy Recursion on Profiles

          This migration fixes an infinite recursion error in the Row Level Security (RLS) policy for the `profiles` table. The original policy caused an error by querying the `profiles` table within its own `USING` clause.

          This script introduces a `SECURITY DEFINER` function to safely retrieve a user's role and updates the `SELECT` policy to use this function, resolving the recursion issue.

          ## Query Description: This operation modifies the security rules for reading user profiles. It drops the old, faulty policy and replaces it with a new, corrected one. There is no risk to existing data, but this change is critical for the application's authentication and data access to function correctly.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Drops policy: "Enable read access based on role" on `public.profiles`
          - Creates function: `public.get_user_role(uuid)`
          - Creates policy: "Enable read access based on role" on `public.profiles`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: This fixes a critical authentication-related database issue.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. The function call is highly efficient.
          */

-- Step 1: Drop the old, faulty policy.
-- The 'if exists' clause makes the script safe to re-run.
DROP POLICY IF EXISTS "Enable read access based on role" ON public.profiles;

-- Step 2: Create a helper function to safely get a user's role.
-- A SECURITY DEFINER function runs with the permissions of the user who created it,
-- allowing it to bypass the RLS policy on the `profiles` table and prevent recursion.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a secure search path to prevent hijacking.
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- Step 3: Recreate the SELECT policy using the safe helper function.
CREATE POLICY "Enable read access based on role"
ON public.profiles
FOR SELECT
USING (
  -- Any user can view their own profile.
  auth.uid() = id
  OR
  -- Admins can view all profiles.
  (get_user_role(auth.uid()) = 'admin')
  OR
  -- Managers can view staff and client profiles.
  (get_user_role(auth.uid()) = 'manager' AND role IN ('staff', 'client'))
);
