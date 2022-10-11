import './BallProgram.sass';
import React, {useMemo, useState, useCallback} from 'react';
import classnames from 'classnames';
import Markdown from 'markdown-to-jsx';
import {backendQueryHook} from "backend";
import ReactTouchEvents from "react-touch-events";

import {EditableDanceProperty} from "components/EditableDanceProperty";
import {LoadingState} from 'components/LoadingState';
import {ProgramTitleSelector} from "components/ProgramTitleSelector";
import {useOnKeydown} from "utils/useOnKeydown";
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  teachedInSet: 'Opetettu setissä',
  requestedDance: 'Toivetanssi',
  intervalMusic: 'Taukomusiikkia',
  addDescription: 'Lisää kuvaus',
  afterThis: 'Tämän jälkeen',
});

const useBallProgram = backendQueryHook(`
query BallProgram($eventId: ID!) {
  event(id: $eventId) {
    _id
    name
    program {
      slideStyleId
      introductions {
        name
        slideStyleId
      }
      danceSets {
        name
        intervalMusicDuration
        program {
          __typename
          ... on ProgramItem {
            _id
            name
            description
            slideStyleId
          }
          ... on RequestedDance {
            slideStyleId
          }
          ... on DanceProgram {
            teachedIn(eventId: $eventId) { _id, name }
          }
          ... on EventProgram {
            showInLists
          }
        }
      }
    }
  }
}`);

export default function BallProgram({eventId}) {
  const {data, refetch, ...loadingState} = useBallProgram({eventId});
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

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <div className={classnames("slideshow", slide.slideStyleId && `slide-style-${slide.slideStyleId}`)}>
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
  __typename: string
  slideStyleId?: string
  name: string
  index?: number
  subindex?: number
  subtotal?: number
  parent?: Slide
  next?: Slide
}

function getSlides(event) : Slide[] {
  const eventHeader = { __typename: 'Event', name: event.name };
  const slides : Slide[] = [eventHeader];
  if (!event.program) return slides;
  const defaultStyleId = event.program.slideStyleId;

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

    if (danceSet.intervalMusicDuration > 0) {
      danceSetSlide.subtotal++
      slides.push({
        __typename: "EventProgram",
        name: t`intervalMusic`,
        parent: danceSetSlide,
      });
    }
  }

  slides.forEach((slide, index) => {
    slide.index = index
    if (slide.parent !== undefined) {
      slide.subindex = index - slide.parent.index!!
      slide.subtotal = slide.parent.subtotal
    }
    if (!slide.slideStyleId) {
      slide.slideStyleId = defaultStyleId
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
    case 'EventProgram':
      return <EventProgramSlide program={slide} onChangeSlide={onChangeSlide} />;
    case 'DanceSet':
    case 'Event':
    default:
      return <HeaderSlide header={slide} onChangeSlide={onChangeSlide} />;
  }
}
function HeaderSlide({header, onChangeSlide}) {
  const {name, program = []} = header;
  return <SimpleSlide title={name} next={null} onChangeSlide={onChangeSlide} >
    <ul className="slide-main-content slide-header-list">
      {program
          .filter(t => t.__typename !== "EventProgram" || t.showInLists)
          .map(({index, name}) =>
            <li onClick={() => onChangeSlide(index)} key={index}>
              {name ?? <RequestedDancePlaceholder />}
            </li>
          )
      }
    </ul>
  </SimpleSlide>;
}

function EventProgramSlide({program, onChangeSlide}) {
  const {name, next, description} = program;
  return <SimpleSlide title={name} next={next} onChangeSlide={onChangeSlide} >
    {description && <section className="slide-main-content"><Markdown>{description}</Markdown></section>}
  </SimpleSlide>;
}

const RequestedDancePlaceholder = () => <>_________________________</>;

function DanceSlide({dance, onChangeSlide}) {
  const {next, name, teachedIn} = dance;

  return <SimpleSlide title={name} next={next} onChangeSlide={onChangeSlide}>
    <section className="slide-main-content slide-dance-description">
      <EditableDanceProperty dance={dance} property="description" type="markdown" addText={t`addDescription`} />
    </section>
    {teachedIn.length > 0 &&
      <p>{t`teachedInSet`} {teachedIn.map(w => w.name).join(", ")}</p>
    }
  </SimpleSlide>;
}

function RequestedDanceSlide({next, onChangeSlide}) {
  return <SimpleSlide title={t`requestedDance`} next={next} onChangeSlide={onChangeSlide}>
  </SimpleSlide>;
}

function SimpleSlide({title, next, onChangeSlide, children}) {
  return <section className="slide">
    <h1 className="slide-title">{title}</h1>
    {children}
    {next &&
        <NextTrackSection next={next}
          onChangeSlide={onChangeSlide} />
    }
  </section>;
}

function NextTrackSection({next, onChangeSlide}) {
  return <section className="slide-next-track" onClick={() => onChangeSlide(next.index)}>
    <h1>{t`afterThis`}:{" "}{next.__typename === 'RequestedDance' ? t`requestedDance` : next.name}</h1>
  </section>
}
