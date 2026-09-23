import { getDatabase } from "../database";

export type Profile = {
  id: number;
  device_id: string;
  display_name: string;
  avatar_id: string;
  created_at: string;
  updated_at: string;
};

export async function getProfile(): Promise<Profile | null> {
  const db = await getDatabase();

  const profile = await db.getFirstAsync<Profile>(
    `
      SELECT *
      FROM profile
      WHERE id = 1
      LIMIT 1
    `,
  );

  return profile ?? null;
}

export async function saveProfile(
  deviceId: string,
  displayName: string,
  avatarId: string,
) {
  const db = await getDatabase();

  const now = new Date().toISOString();

  await db.runAsync(
    `
      INSERT INTO profile (
        id,
        device_id,
        display_name,
        avatar_id,
        created_at,
        updated_at
      )
      VALUES (1, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        device_id = excluded.device_id,
        display_name = excluded.display_name,
        avatar_id = excluded.avatar_id,
        updated_at = excluded.updated_at
    `,
    deviceId,
    displayName,
    avatarId,
    now,
    now,
  );
}