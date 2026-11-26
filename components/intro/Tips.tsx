import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

/** Loading tips, shown one after another by CSS over the ~3s of the loading screen. */
export function Tips({ tips, className }: { tips: readonly string[]; className?: string }) {
  // The tips share the 2.5s intro (from 0.15s to the exit at about 2.5s).
  const each = 2.35 / tips.length
  return (
    <div className={cn("grid min-w-0", className)}>
      {tips.map((tip, i) => {
        const [, label, rest] = /^(Tip:)\s*(.*)$/.exec(tip) ?? [null, null, tip]
        return (
          <p
            key={tip}
            className={cn("ow-tip col-start-1 row-start-1 max-w-[46ch] text-[0.8125rem] leading-snug font-semibold text-ink lg:text-sm", i === tips.length - 1 && "ow-tip-last")}
            style={{ "--d": `${each}s`, "--delay": `${0.15 + i * each}s` } as CSSProperties}
          >
            {label && <span className="mr-2 font-mono text-pink">{label.replace(":", "")}</span>}
            {rest}
          </p>
        )
      })}
    </div>
  )
}
