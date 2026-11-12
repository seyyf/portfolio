import { createElement } from "react"

import type { Widget } from "@/data/city"

import { BeforeAfterSlider } from "./BeforeAfterSlider"
import { CoffeeOrder } from "./CoffeeOrder"
import { ContactForm } from "./ContactForm"
import { Est2020 } from "./Est2020"
import { QrMenu } from "./QrMenu"
import { SwipeGame } from "./SwipeGame"
import { Ticket } from "./Ticket"
import { Toolbox } from "./Toolbox"

export { BeforeAfterSlider, CoffeeOrder, ContactForm, Est2020, QrMenu, SwipeGame, Ticket, Toolbox }

/** Renders the interactive extra for a building's info panel (null for unknown widgets). */
export function WidgetFor({ widget }: { widget: Widget }) {
  switch (widget) {
    case "beforeAfter":
      return createElement(BeforeAfterSlider)
    case "ticket":
      return createElement(Ticket)
    case "coffee":
      return createElement(CoffeeOrder)
    case "qrMenu":
      return createElement(QrMenu)
    case "est2020":
      return createElement(Est2020)
    case "swipe":
      return createElement(SwipeGame)
    case "contact":
      return createElement(ContactForm)
    case "toolbox":
      return createElement(Toolbox)
    default:
      return null
  }
}
