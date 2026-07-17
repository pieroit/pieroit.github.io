import * as React from 'react'
import Slider from 'react-slick'

export default function Carousel(props: any) {
  return (
    <div className="mx-auto overflow-hidden py-12 text-center">
      <h2>Trusted by</h2>
      <Slider {...props.settings}>
        {props.items.map((i: any) => (
          <div
            key={i.url}
            className="flex h-full max-w-[250px] min-w-[250px] items-center justify-center px-6 py-0"
          >
            <img
              className="h-[100px] object-contain"
              src={`/static/logos/${i.url}`}
              width={'100%'}
              alt={i.alt}
            />
          </div>
        ))}
      </Slider>
    </div>
  )
}
