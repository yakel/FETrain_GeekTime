import { createElement } from './framework'
import { Carousel } from './carousel.js'
import { Timeline, Animation } from './animation.js'

let images = [
  'bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  '1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  '73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
]
images = images.map((x) => 'https://static001.geekbang.org/resource/image/' + x)

const a = <Carousel src={images} />
a.mountTo(document.body)

// const timeline = new Timeline()
// const animation = new Animation(
//   {
//     set a(v) {
//       console.log(v)
//     },
//   },
//   'a',
//   0,
//   100,
//   1000,
//   null
// )
// timeline.add(animation)
// timeline.start()
