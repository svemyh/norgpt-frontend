"use client"

import { animate } from "framer-motion"
import { useEffect, useState } from "react"

export function useAnimatedText(text: string, delimiter = "") {
  const [cursor, setCursor] = useState(0)
  const [startingCursor, setStartingCursor] = useState(0)
  const [prevText, setPrevText] = useState(text)

  if (prevText !== text) {
    setPrevText(text)
    setStartingCursor(text.startsWith(prevText) ? cursor : 0)
  }

  useEffect(() => {
    const parts = text.split(delimiter)
    // Fixed 300ms duration regardless of text length
    const duration = 0.3

    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest))
      },
    })

    return () => controls.stop()
  }, [startingCursor, text, delimiter])

  return text.split(delimiter).slice(0, cursor).join(delimiter)
}
