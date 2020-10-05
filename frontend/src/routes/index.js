import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Events from "./events";
import Dances from "pages/Dances";

export default function() {
  return <Routes>
    <Route path="events/*" element={<Events />} />
    <Route path="dances" element={<Dances/>} />
    <Route path="*" element={<Home/>} />
  </Routes>;
}

function Home() {
  return <Navigate to="/events" replace={true} />;
}
