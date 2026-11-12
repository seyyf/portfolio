/**
 * Stable DOM container for every drei <Html> label. Without a fixed target, Html re-creates its React
 * root when the canvas' event target connects, and the deferred unmount of the old root can wipe the
 * new label. CityShell renders the container (an overlay the size of the canvas) and fills this ref.
 */
export const labelsPortal: { current: HTMLElement | null } = { current: null }
