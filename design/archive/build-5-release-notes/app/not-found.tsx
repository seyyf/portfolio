import { ButtonLink } from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-24 sm:px-6 md:py-32">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-3 max-w-[20ch] text-4xl font-semibold sm:text-5xl">This release doesn&apos;t exist.</h1>
      <p className="mt-4 max-w-[56ch] text-muted">The page may have moved, or the link has a typo. Every release is in the changelog.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/#releases">Open the changelog</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Go to the home page
        </ButtonLink>
      </div>
    </div>
  )
}
