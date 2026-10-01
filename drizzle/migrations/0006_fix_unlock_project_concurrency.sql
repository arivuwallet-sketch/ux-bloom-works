-- Prevent concurrent unlock_project() calls for the same project from spending
-- more than one credit. The project_unlocks primary key becomes the atomic
-- claim: only the transaction that inserts the unlock row may debit a credit.
CREATE OR REPLACE FUNCTION public.unlock_project(_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _owner uuid;
  _claimed_project uuid;
  _updated integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT user_id
    INTO _owner
    FROM public.projects
    WHERE id = _project_id;

  IF _owner IS NULL OR _owner <> _uid THEN
    RETURN false;
  END IF;

  -- Atomically claim the unlock. Concurrent callers for the same project block
  -- on the unique project_id and only one can obtain the claim.
  INSERT INTO public.project_unlocks(project_id, user_id)
    VALUES (_project_id, _uid)
    ON CONFLICT (project_id) DO NOTHING
    RETURNING project_id INTO _claimed_project;

  -- No claim means this project was already unlocked. Only report success when
  -- the existing unlock belongs to the authenticated owner.
  IF _claimed_project IS NULL THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.project_unlocks
      WHERE project_id = _project_id
        AND user_id = _uid
    );
  END IF;

  -- user_credits is a single row per user. PostgreSQL serializes concurrent
  -- debits on that row; the balance predicate is rechecked after any wait.
  UPDATE public.user_credits
    SET balance = balance - 1,
        updated_at = now()
    WHERE user_id = _uid
      AND balance > 0;

  GET DIAGNOSTICS _updated = ROW_COUNT;

  -- If there is no credit, release the claim before returning. Because this all
  -- happens inside the function transaction, callers never observe a charged
  -- credit without a matching unlock or an unlock without a successful debit.
  IF _updated = 0 THEN
    DELETE FROM public.project_unlocks
      WHERE project_id = _project_id
        AND user_id = _uid;
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unlock_project(uuid) TO authenticated;
