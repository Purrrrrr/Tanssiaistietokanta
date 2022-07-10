import './BallProgram.sass';
import React, {useMemo, useState, useCallback} from 'react';
import {gql, useQuery} from "services/Apollo";
import ReactTouchEvents from "react-touch-events";

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

  const changeSlide = useCallback((n) => 
    onChangeSlide((s) => 
      Math.max(0, 
        Math.min(program.length-1, s+n)
      )
    )
  , [onChangeSlide, program.length])

  useOnKeydown({
    ArrowLeft: () => changeSlide(-1),
    ArrowRight: () => changeSlide(1),
    r: onRefetch
  })

  const onSwipe = useCallback((e, direction : 'left'|'right') => {
    switch(direction) {
      case 'left':
        changeSlide(1)
        break
      case 'right':
        changeSlide(-1)
        break
    }
  }, [changeSlide])

  return <ReactTouchEvents onSwipe={onSwipe}>
    <div className="slideshow">
      <div className="controls">
        <ProgramTitleSelector value={slide.parent?.index ?? slide.index} onChange={onChangeSlide}
          program={program} />
        {slide.subindex && ` ${slide.subindex}/${slide.subtotal} `}
      </div>
      <SlideView slide={slide} onChangeSlide={onChangeSlide} />
    </div>
  </ReactTouchEvents>;
}

interface Slide {
  __typename: string,
  name: string,
  index?: number,
  subindex?: number,
  subtotal?: number,
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
    const danceSetSlide = { ...danceSet, subtotal: danceSet.program.length };
    const danceProgram = danceSet.program.map(item => ({ ...item, parent: danceSetSlide}));
    danceSetSlide.program = danceProgram;
    slides.push(danceSetSlide);
    slides.push(...danceProgram);
  }

  slides.forEach((slide, index) => {
    slide.index = index
    if (slide.parent !== undefined) {
      slide.subindex = index - slide.parent.index!!
      slide.subtotal = slide.parent.subtotal
    }

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
  return <SimpleSlide title={name}>
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
  </SimpleSlide>;
}

const RequestedDancePlaceholder = () => <>_________________________</>;

function DanceSlide({dance, onChangeSlide}) {
  const {next, name, teachedIn} = dance;

  return <SimpleSlide title={name}>
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

  </SimpleSlide>;
}

function NextTrackSection({next, onChangeSlide}) {
  return <section className="nextTrack" onClick={() => onChangeSlide(next.index)}>
    <h1>{t`afterThis`}:{" "+next.name}</h1>
    <div>{next.description}</div>
  </section>
}

function RequestedDanceSlide({next, onChangeSlide}) {
  return <SimpleSlide title={t`requestedDance`}>
    {next && next.type === 'DANCE' &&
        <NextTrackSection next={next}
          onChangeSlide={onChangeSlide} />
    }

  </SimpleSlide>;
}

function SimpleSlide({title, children}) {
  return <section className="slide">
    <h1>{title}</h1>
    {children}
  </section>;
}
