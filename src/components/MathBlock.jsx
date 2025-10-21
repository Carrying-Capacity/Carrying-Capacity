import React from 'react';
import 'katex/dist/katex.min.css';
import {BlockMath } from 'react-katex';

export default function MathBlock({ math }) {
  return <BlockMath math={math} />;
}