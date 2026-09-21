const SOUND_KEY = "notificationSoundEnabled"

let audioCtx: AudioContext | null = null

const getContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null
    if (!audioCtx) {
        const Ctor = window.AudioContext || (window as any).webkitAudioContext
        if (!Ctor) return null
        audioCtx = new Ctor()
    }
    return audioCtx
}

/** Call once on mount. Unlocks audio on the first user interaction. Returns a cleanup function. */
export const setupSoundUnlock = (): (() => void) => {
    if (typeof window === "undefined") return () => { }

    const events = ["pointerdown", "keydown", "touchstart"] as const

    const cleanup = () => events.forEach((e) => window.removeEventListener(e, unlock))

    function unlock() {
        const ctx = getContext() // created INSIDE a user gesture, so it is allowed to run
        if (ctx && ctx.state === "suspended") ctx.resume().catch(() => { })
        cleanup()
    }

    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }))
    return cleanup
}

/** Plays a short two-tone ding. If audio is still locked, it silently does nothing. */
export const playNotificationSound = async (fromUserGesture = false) => {
    const ctx = getContext()
    if (!ctx) return

    if (ctx.state === "suspended" && fromUserGesture) {
        try {
            await ctx.resume()
        } catch {
            return
        }
    }
    if (ctx.state !== "running") return

    const now = ctx.currentTime
    const tones = [
        { freq: 880, start: 0, duration: 0.18 }, // A5
        { freq: 1318.5, start: 0.12, duration: 0.35 }, // E6
    ]

    tones.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + start)

        // quick fade in / smooth fade out, so it does not "click"
        gain.gain.setValueAtTime(0.0001, now + start)
        gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + start)
        osc.stop(now + start + duration + 0.05)
    })
}

/* Sound on/off preference (saved in the browser) */

export const getSoundEnabled = (): boolean => {
    try {
        return localStorage.getItem(SOUND_KEY) !== "false"
    } catch {
        return true
    }
}

export const setSoundEnabled = (enabled: boolean) => {
    try {
        localStorage.setItem(SOUND_KEY, String(enabled))
    } catch {
    }
}