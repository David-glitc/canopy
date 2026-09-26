import React from 'react';
import {Composition} from 'remotion';
import {CanopyDemo} from './CanopyDemo';

export const Root: React.FC = () => (
  <Composition
    id="CanopyDemo"
    component={CanopyDemo}
    durationInFrames={2400}
    fps={30}
    width={1920}
    height={1080}
  />
);
