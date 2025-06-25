import * as React from 'react'
import Slider from "react-slick";

export default function Carousel(props: any) {
  return (
    <div className="py-12 text-center mx-auto overflow-hidden">
      <h2>Trusted by</h2>
      <Slider {...props.settings}
      >
        {props.items.map((i: any) => (
          <div key={i.url} className="px-6 py-0 min-w-[250px] max-w-[250px] flex items-center justify-center h-full">
            <img  className="h-[100px] object-contain"
                src={`/static/logos/${i.url}`}
                width={"100%"}
                alt={i.alt}   
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}