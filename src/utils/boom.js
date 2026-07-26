const COLORS = ['#ffb3f6', '#7aa0ff', '#333333']

// star / spiky-star / diamond outlines, normalized to a 0-36 viewBox
const SHAPES = [
  '<polygon points="18,0 24.05,9.3 33.5,11.6 27.1,19.7 27.6,29.9 18,26.4 8.4,29.9 8.9,19.7 2.5,11.6 11.95,9.3"></polygon>',
  '<polygon points="18,0 22.24,13.76 36,18 22.24,22.24 18,36 13.76,22.24 0,18 13.76,13.76"></polygon>',
  '<polygon points="18,0 27.19,8.81 36,18 27.19,27.19 18,36 8.81,27.19 0,18 8.81,8.81"></polygon>',
]

// Bursts a shower of little SVG shapes out of `layer` (an absolutely
// positioned, zero-size element pinned to the button's top-left corner)
// starting at the click point, then fades/scales them out and removes them.
export function boom(layer, originX, originY) {
  const count = Math.floor(Math.random() * 20) + 20 // 20-39 particles
  const particles = []

  for (let i = 0; i < count; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    const startScale = (Math.floor(Math.random() * 5) + 4) / 10 // 0.4-0.8
    const duration = Math.floor(Math.random() * 1700) + 1000 // 1000-2699ms
    const targetX = Math.floor(Math.random() * 250) - 100 // -100..149
    const targetY = Math.floor(Math.random() * 250) - 100

    const el = document.createElement('div')
    el.className = 'boom-particle'
    el.style.top = `${originY}px`
    el.style.left = `${originX}px`
    el.style.transform = `scale(${startScale})`
    el.style.transitionDuration = `${duration}ms`
    el.innerHTML = `<svg width="18" height="18" viewBox="0 0 36 36" fill="${color}">${shape}</svg>`

    layer.appendChild(el)
    particles.push({ el, targetX, targetY })
  }

  // flush layout so the position/scale change below is picked up as a
  // transition rather than the particles just appearing at their target
  void layer.offsetWidth

  requestAnimationFrame(() => {
    particles.forEach(({ el, targetX, targetY }) => {
      el.style.left = `${targetX + 25}px`
      el.style.top = `${targetY + 25}px`
      el.style.transform = 'scale(0)'
    })
  })

  setTimeout(() => {
    particles.forEach(({ el }) => el.remove())
  }, 2000)
}
