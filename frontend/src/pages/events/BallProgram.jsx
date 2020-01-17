import React, {useState, useMemo} from 'react';
import {gql, useQuery} from "services/Apollo";

import {LoadingState} from 'components/LoadingState';
import {ProgramTitleSelector} from "components/ProgramTitleSelector";
import {EditableDanceProperty} from "components/EditableDanceProperty";
import {useOnKeydown} from "utils/useOnKeydown";

import './BallProgram.sass';

const GET_BALL_PROGRAM = gql`
query BallProgram($eventId: ID!) {
  event(id: $eventId) {
    _id
    name
    program {
      name
      type
      dance{
        _id
        description
        teachedIn(eventId: $eventId) { _id, name }
      }
    }
  }
}`;

export default function BallProgram({eventId}) {
  const {data, refetch, ...loadingState} = useQuery(GET_BALL_PROGRAM, {variables: {eventId}});
  const [slide, setSlide] = useState(0);

  if (!data) return <LoadingState {...loadingState} refetch={refetch} />

  return <BallProgramView event={data.event} onRefetch={refetch}
    currentSlide={slide} onChangeSlide={setSlide} />;
}

function BallProgramView({event, currentSlide, onChangeSlide, onRefetch}) {
  const program = useMemo(() => getSlides(event), [event]);
  const slide = program[currentSlide];

  useOnKeydown({
    ArrowLeft: () => onChangeSlide((s) => Math.max(0, s-1)),
    ArrowRight: () => onChangeSlide((s) => Math.min(s+1, program.length-1)),
    r: onRefetch
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
      //The if is a hack to ensure the first slide only has the event title in it
      if (header.subItems) header.subItems.push(currentItem);
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
    default:
      return <HeaderSlide header={slide} onChangeSlide={onChangeSlide} />;
  }
}
function HeaderSlide({header, onChangeSlide}) {
  return (<section className="slide">
    <h1>{header.name}</h1>
    <ul>
      {(header.subItems || [])
          .filter(t => t.type !== "INTERVAL_MUSIC")
          .map(({index, name}) => 
            <li onClick={() => onChangeSlide(index)} key={index}>{name}</li>)}
    </ul>
  </section>);
}

function DanceSlide({dance, onChangeSlide}) {
  const {next, name, dance: {teachedIn}} = dance;

  return <section className="slide">
    <h1>{name}</h1>
    <p>
      <EditableDanceProperty dance={dance.dance} property="description" multiline addText="Lisää kuvaus" />
    </p>
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
