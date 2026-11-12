/** Shown for the split second an app's code is still downloading. */
export function AppLoading() {
  return (
    <div className="grid h-full place-items-center bg-bg" role="status" aria-label="Opening app">
      <span className="size-7 animate-spin rounded-full border-[3px] border-text/15 border-t-text/60" />
    </div>
  )
}
