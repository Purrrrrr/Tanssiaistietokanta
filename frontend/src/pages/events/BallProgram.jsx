import React, {useState, useMemo} from 'react';
import {gql, useQuery} from "services/Apollo";

import {ProgramTitleSelector} from "components/ProgramTitleSelector";
import {useOnKeydown} from "utils/useOnKeydown";

import './BallProgram.sass';

const GET_BALL_PROGRAM = gql`
query getEvent($eventId: ID!) {
  event(id: $eventId) {
    name
    program {
      name
      type
      dance{
        _id
        teachedIn(eventId: $eventId) { _id, name }
      }
    }
  }
}`;

export default function BallProgram({eventId}) {
  const {data} = useQuery(GET_BALL_PROGRAM, {variables: {eventId}});
  const [slide, setSlide] = useState(0);

  if (!data) return '...';

  return <BallProgramView event={data.event} 
    currentSlide={slide} onChangeSlide={setSlide} />;
}

function BallProgramView({event, currentSlide, onChangeSlide}) {
  const program = useMemo(() => getSlides(event), [event]);
  const slide = program[currentSlide];

  useOnKeydown({
    ArrowLeft: () => onChangeSlide((s) => Math.max(0, s-1)),
    ArrowRight: () => onChangeSlide((s) => Math.min(s+1, program.length-1)),
  })

  return <div className="slideshow">
    <ProgramTitleSelector value={slide.header.index} onChange={onChangeSlide}
      program={program} />
    <SlideView slide={slide} onChangeSlide={onChangeSlide} />
  </div>;
}

function getSlides(event) {
  const eventHeader = {
    type: 'HEADER',
    name: event.name,
    subItems: [],
    index: 0
  };
  eventHeader.header = eventHeader;
  const slides = [eventHeader];
  let header = eventHeader;
  let previousItem = eventHeader;

  event.program.forEach((item, index) => {
    const currentItem = { header, index: index+1, ...item };
    if (item.type === 'HEADER') {
      currentItem.header = currentItem;
      currentItem.subItems = [];
      header = currentItem;
    } else {
      header.subItems.push(currentItem);
    }
    slides.push(currentItem);
    previousItem.next = currentItem;
    previousItem = currentItem;
  });
  return slides;
}

function SlideView({slide, onChangeSlide}) {
  switch(slide.type) {
    case 'DANCE':
      return <DanceSlide dance={slide} onChangeSlide={onChangeSlide} />;
    case 'HEADER':
      return <HeaderSlide header={slide} onChangeSlide={onChangeSlide} />;
    default:
      return null;
  }
}
function HeaderSlide({header, onChangeSlide}) {
  return (<section className="slide">
    <h1>{header.name}</h1>
    <ul>
      {header.subItems
          .filter(t => t.type !== "INTERVAL_MUSIC")
          .map(({index, name}) => 
            <li onClick={() => onChangeSlide(index)} key={index}>{name}</li>)}
    </ul>
  </section>);
}

function DanceSlide({dance, onChangeSlide}) {
  const {next, name, description, dance: {teachedIn}} = dance;

  return <section className="slide">
    <h1>{name}</h1>
    <p>{description}</p>
    {teachedIn.length > 0 && 
      <p>Opetettu setissä {teachedIn.map(w => w.name).join(", ")}</p>
    }
    {next && next.type === 'DANCE' &&
        <NextTrackSection next={next}
          onChangeSlide={onChangeSlide} />
    }

  </section>;
}

function NextTrackSection({next, onChangeSlide}) {
  return <section className="nextTrack" onClick={() => onChangeSlide(next.index)}>
    <h1>Tämän jälkeen:{" "+next.name}</h1>
    <div>{next.description}</div>
  </section>
}
