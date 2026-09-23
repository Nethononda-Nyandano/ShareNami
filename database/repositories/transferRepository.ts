
import { getDatabase } from "../database";

export type Transfer = {
  id: number;
  session_id: string;
  device_id: string;
  status: string;
  created_at: string;
  expires_at: string;
};

export type TransferFile = {
  id: number;
  session_id: string;
  file_uri: string;
  file_name: string;
  file_size: number;
  mime_type?: string | null;
  created_at: string;
};

export type CreateTransferInput = {
  sessionId: string;
  deviceId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
};

export type CreateTransferFileInput = {
  sessionId: string;
  fileUri: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
};

export async function createTransfer(
  input: CreateTransferInput,
) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO transfers (
        session_id,
        device_id,
        status,
        created_at,
        expires_at
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    input.sessionId,
    input.deviceId,
    input.status,
    input.createdAt,
    input.expiresAt,
  );
}

export async function addTransferFile(
  input: CreateTransferFileInput,
) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO transfer_files (
        session_id,
        file_uri,
        file_name,
        file_size,
        mime_type,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    input.sessionId,
    input.fileUri,
    input.fileName,
    input.fileSize,
    input.mimeType ?? null,
    new Date().toISOString(),
  );
}

export async function getTransfer(
  sessionId: string,
): Promise<Transfer | null> {
  const db = await getDatabase();

  const transfer =
    await db.getFirstAsync<Transfer>(
      `
        SELECT *
        FROM transfers
        WHERE session_id = ?
        LIMIT 1
      `,
      sessionId,
    );

  return transfer ?? null;
}

export async function getTransferFiles(
  sessionId: string,
): Promise<TransferFile[]> {
  const db = await getDatabase();

  return await db.getAllAsync<TransferFile>(
    `
      SELECT *
      FROM transfer_files
      WHERE session_id = ?
      ORDER BY id ASC
    `,
    sessionId,
  );
}

export async function updateTransferStatus(
  sessionId: string,
  status: string,
) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE transfers
      SET status = ?
      WHERE session_id = ?
    `,
    status,
    sessionId,
  );
}

export async function deleteTransfer(
  sessionId: string,
) {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM transfer_files
      WHERE session_id = ?
    `,
    sessionId,
  );

  await db.runAsync(
    `
      DELETE FROM transfers
      WHERE session_id = ?
    `,
    sessionId,
  );
}

