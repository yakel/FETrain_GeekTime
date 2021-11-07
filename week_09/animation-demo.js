import { Timeline, Animation } from './animation.js'

const timeline = new Timeline()
const animation = new Animation(
  document.getElementById('el').style,
  'transform',
  0,
  500,
  2000,
  0,
  null,
  (v) => `translateX(${v}px)`
)
timeline.add(animation)
timeline.start()

const pause = document.getElementById('pause')
pause.addEventListener('click', () => timeline.pause())

const resume = document.getElementById('resume')
resume.addEventListener('click', () => timeline.resume())
