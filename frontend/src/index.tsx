import {createRoot} from 'react-dom/client'

import DanceOrganizer from './DanceOrganizer'

import './index.css'

const root = createRoot(document.getElementById('root') as HTMLDivElement)
root.render(<DanceOrganizer/>)
