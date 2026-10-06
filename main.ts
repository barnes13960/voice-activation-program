const SAMPLES = 30

let yesSamples: number[][] = []
let noSamples: number[][] = []
let heartSamples: number[][] = []

let yesSig: number[] = []
let noSig: number[] = []
let heartSig: number[] = []

// Smooth dB reading
function smoothDb(): number {
    let total = 0
    for (let i = 0; i < 5; i++) {
        total += input.soundLevelDb()
        basic.pause(5)
    }
    return total / 5
}

// Record a normalized sample
function recordSample(): number[] {
    let curve: number[] = []

    // Wait for actual sound
    while (smoothDb() < -40) {
        basic.pause(10)
    }

    for (let i = 0; i < SAMPLES; i++) {
        curve.push(smoothDb())
        basic.pause(20)
    }

    // Normalize
    let maxVal = -999
    for (let v of curve) {
        if (v > maxVal) maxVal = v
    }
    for (let i = 0; i < SAMPLES; i++) {
        curve[i] = curve[i] - maxVal
    }

    return curve
}

// Average all samples into a signature
function averageSignature(samples: number[][]): number[] {
    let result: number[] = []
    for (let i = 0; i < SAMPLES; i++) {
        let total = 0
        for (let s of samples) {
            total += s[i]
        }
        result.push(total / samples.length)
    }
    return result
}

// Compare two curves
function difference(a: number[], b: number[]): number {
    let score = 0
    for (let i = 0; i < SAMPLES; i++) {
        score += Math.abs(a[i] - b[i])
    }
    return score
}

// -------------------------
// BUTTON A → ADD TRAINING
// -------------------------
input.onButtonPressed(Button.A, function () {
    basic.showString("ADD")

    // YES
    basic.showString("YES")
    yesSamples.push(recordSample())
    yesSig = averageSignature(yesSamples)

    // NO
    basic.showString("NO")
    noSamples.push(recordSample())
    noSig = averageSignature(noSamples)

    // HEART
    basic.showString("HEART")
    heartSamples.push(recordSample())
    heartSig = averageSignature(heartSamples)

    basic.showString("OK")
})

// -------------------------
// BUTTON B → LISTEN MODE
// -------------------------
input.onButtonPressed(Button.B, function () {
    basic.showString("LISTEN")

    basic.forever(function () {
        let live = recordSample()

        let yesScore = difference(live, yesSig)
        let noScore = difference(live, noSig)
        let heartScore = difference(live, heartSig)

        let best = yesScore
        if (noScore < best) best = noScore
        if (heartScore < best) best = heartScore

        if (best == yesScore) {
            basic.showIcon(IconNames.Yes)
        } else if (best == noScore) {
            basic.showIcon(IconNames.No)
        } else {
            basic.showIcon(IconNames.Heart)
        }

        basic.pause(200)
    })
})
