/**
 * Big blurred colour blobs behind the phone on tablet/desktop. Their colours follow the open app's
 * accent (CSS variables set by the stage) and the theme.
 */
export function AmbientBackground({ accent, accent2 }: { accent: string; accent2: string }) {
  const blob = "absolute rounded-full blur-[90px] transition-[background-color] duration-[900ms] motion-safe:animate-[blob-a_26s_ease-in-out_infinite_alternate]"
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-bg">
      <div className={`${blob} -top-[20%] -left-[10%] h-[70vmax] w-[70vmax] opacity-55`} style={{ backgroundColor: accent }} />
      <div className={`${blob} -right-[15%] -bottom-[25%] h-[65vmax] w-[65vmax] opacity-45 [animation-direction:alternate-reverse]`} style={{ backgroundColor: accent2 }} />
      <div className={`${blob} top-[30%] left-[35%] h-[35vmax] w-[35vmax] bg-[var(--wp-3)] opacity-40`} />
      {/* Fine grain keeps large gradients from banding. */}
      <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:3px_3px]" />
    </div>
  )
}
