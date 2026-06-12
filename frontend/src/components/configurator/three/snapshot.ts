// Bridge for capturing a PNG snapshot of the live 3D canvas from outside the
// Canvas tree (used by the review step). The Canvas registers a capture
// function here; the review step calls captureSnapshot().

export const snapshotBridge: { capture: (() => string | null) | null } = {
  capture: null,
};

/** Returns a data:image/png;base64,... of the current 3D view, or null. */
export function captureSnapshot(): string | null {
  try {
    return snapshotBridge.capture?.() ?? null;
  } catch {
    return null;
  }
}
