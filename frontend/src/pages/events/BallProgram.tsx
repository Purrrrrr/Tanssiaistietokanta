import './BallProgram.sass';

import React, {useMemo, useState} from 'react';
import {gql, useQuery} from "services/Apollo";

import {EditableDanceProperty} from "components/EditableDanceProperty";
import {LoadingState} from 'components/LoadingState';
import {ProgramTitleSelector} from "components/ProgramTitleSelector";
import {useOnKeydown} from "utils/useOnKeydown";
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  teachedInSet: 'Opetettu setissä',
  requestedDance: 'Toivetanssi',
  addDescription: 'Lisää kuvaus',
  afterThis: 'Tämän jälkeen',
});

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
    <ProgramTitleSelector value={slide.parent?.index ?? slide.index} onChange={onChangeSlide}
      program={program} />
    <SlideView slide={slide} onChangeSlide={onChangeSlide} />
  </div>;
}

interface Slide {
  __typename: string,
  name: string,
  index?: number,
  parent?: Slide
  next?: Slide
}

function getSlides(event) : Slide[] {
  const eventHeader = { __typename: 'Event', name: event.name };
  const slides : Slide[] = [eventHeader];
  if (!event.program) return slides;

  const {introductions, danceSets} = event.program;
  for (const introduction of introductions) {
    slides.push({ ...introduction, parent: eventHeader });
  }
  for (const danceSet of danceSets) {
    const danceSetSlide = { ...danceSet };
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

function SlideView({slide, onChangeSlide}) {
  switch(slide.__typename) {
    case 'Dance':
      return <DanceSlide dance={slide} onChangeSlide={onChangeSlide} />;
    case 'RequestedDance':
      return <RequestedDanceSlide next={slide.next} onChangeSlide={onChangeSlide} />;
    case 'DanceSet':
    case 'Event':
    default:
      return <HeaderSlide header={slide} onChangeSlide={onChangeSlide} />;
  }
}
function HeaderSlide({header, onChangeSlide}) {
  const {name, program = []} = header;
  return <Slide title={name}>
    <ul>
      {program
          .filter(t => t.__typename !== "IntervalMusic")
          .map(({index, name}) =>
            <li onClick={() => onChangeSlide(index)} key={index}>
              {name ?? <RequestedDancePlaceholder />}
            </li>
          )
      }
    </ul>
  </Slide>;
}

const RequestedDancePlaceholder = () => <>_________________________</>;

function DanceSlide({dance, onChangeSlide}) {
  const {next, name, teachedIn} = dance;

  return <Slide title={name}>
    <p>
      <EditableDanceProperty dance={dance} property="description" multiline addText={t`addDescription`} />
    </p>
    {teachedIn.length > 0 &&
      <p>{t`teachedInSet`} {teachedIn.map(w => w.name).join(", ")}</p>
    }
    {next && next.type === 'DANCE' &&
        <NextTrackSection next={next}
          onChangeSlide={onChangeSlide} />
    }

  </Slide>;
}

function NextTrackSection({next, onChangeSlide}) {
  return <section className="nextTrack" onClick={() => onChangeSlide(next.index)}>
    <h1>{t`afterThis`}:{" "+next.name}</h1>
    <div>{next.description}</div>
  </section>
}

function RequestedDanceSlide({next, onChangeSlide}) {
  return <Slide title={t`requestedDance`}>
    {next && next.type === 'DANCE' &&
        <NextTrackSection next={next}
          onChangeSlide={onChangeSlide} />
    }

  </Slide>;
}

function Slide({title, children}) {
  return <section className="slide">
    <h1>{title}</h1>
    {children}
  </section>;
}
