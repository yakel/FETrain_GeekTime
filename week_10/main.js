import { createElement } from './framework'
// import { Carousel } from './Carousel.js'
// import { Button } from './Button.js'
import { List } from './List.js'

let images = [
  'bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  '1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  '73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
]
images = images.map((x) => ({
  img: 'https://static001.geekbang.org/resource/image/' + x,
  url: 'https://time.geekbang.org',
  title: 'Cat',
}))

// const carousel = (
//   <Carousel
//     src={images}
//     onChange={(event) => console.log(event.detail.position)}
//     onClick={(event) => (location.href = event.detail.data.url)}
//   />
// )
// carousel.mountTo(document.body)

// const button = <Button>Content</Button>
// button.mountTo(document.body)

const list = (
  <List data={images}>
    {(record) => (
      <div>
        <img src={record.img} />
        <a src={record.url} />
        {record.title}
      </div>
    )}
  </List>
)
list.mountTo(document.body)
