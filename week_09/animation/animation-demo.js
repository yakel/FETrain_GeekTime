import { Timeline, Animation } from './animation.js'
import { ease, easeIn, easeOut, easeInOut } from './ease.js'

const timeline = new Timeline()
const animation = new Animation(
  document.getElementById('el').style,
  'transform',
  0,
  500,
  2000,
  0,
  easeOut,
  (v) => `translateX(${v}px)`
)
timeline.add(animation)
timeline.start()

const el2 = document.getElementById('el2')
el2.style.transition = 'transform ease-out 2s'
el2.style.transform = 'translateX(500px)'

const pause = document.getElementById('pause')
pause.addEventListener('click', () => timeline.pause())

const resume = document.getElementById('resume')
resume.addEventListener('click', () => timeline.resume())
