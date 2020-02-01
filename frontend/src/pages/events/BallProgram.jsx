import './BallProgram.sass';

import React, {useMemo, useState} from 'react';
import {gql, useQuery} from "services/Apollo";

import {EditableDanceProperty} from "components/EditableDanceProperty";
import {LoadingState} from 'components/LoadingState';
import {ProgramTitleSelector} from "components/ProgramTitleSelector";
import {useOnKeydown} from "utils/useOnKeydown";

const GET_BALL_PROGRAM = gql`
query BallProgram($eventId: ID!) {
  event(id: $eventId) {
    _id
    name
    program {
      introductions {
        name
      }
      danceSets {
        name
        program {
          __typename
          ... on NamedProgram {
            name
          }
          ... on Dance {
            _id
            description
            teachedIn(eventId: $eventId) { _id, name }
          }
        }
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
    <ProgramTitleSelector value={slide.parent.index} onChange={onChangeSlide}
      program={program} />
    <SlideView slide={slide} onChangeSlide={onChangeSlide} />
  </div>;
}

function getSlides(event) {
  const eventHeader = selfParent({ __typename: 'Event', name: event.name });
  const slides = [eventHeader];
  if (!event.program) return slides;

  const {introductions, danceSets} = event.program;
  for (const introduction of introductions) {
    slides.push({ ...introduction, parent: eventHeader });
  }
  for (const danceSet of danceSets) {
    const danceSetSlide = selfParent({ ...danceSet });
    const danceProgram = danceSet.program.map(item => ({ ...item, parent: danceSetSlide}));
    danceSetSlide.program = danceProgram;
    slides.push(danceSetSlide);
    slides.push(...danceProgram);
  }

  slides.forEach((slide, index) => {
    slide.index = index
    slide.next = slides[index+1];
  });
  return slides;
}

function selfParent(obj) {
  obj.parent = obj;
  return obj;
}

function SlideView({slide, onChangeSlide}) {
  switch(slide.__typename) {
    case 'Dance':
      return <DanceSlide dance={slide} onChangeSlide={onChangeSlide} />;
    case 'DanceSet':
    default:
      return <HeaderSlide header={slide} onChangeSlide={onChangeSlide} />;
  }
}
function HeaderSlide({header, onChangeSlide}) {
  return (<section className="slide">
    <h1>{header.name ?? '____________________'}</h1>
    <ul>
      {(header.program || [])
          .filter(t => t.__typename !== "IntervalMusic")
          .map(({index, name}) => 
            <li onClick={() => onChangeSlide(index)} key={index}>{name ?? '____________________'}</li>)}
    </ul>
  </section>);
}

function DanceSlide({dance, onChangeSlide}) {
  const {next, name, ...teachedIn} = dance;

  return <section className="slide">
    <h1>{name}</h1>
    <p>
      <EditableDanceProperty dance={dance} property="description" multiline addText="Lisää kuvaus" />
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
