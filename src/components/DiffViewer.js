import React from 'react';
import { Diff2Html } from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

export default function DiffViewer({ rawDiff }) {
  const html = Diff2Html.getPrettyHtml(rawDiff, {
    inputFormat: 'diff',
    showFiles: true,
    matching: 'lines',
    outputFormat: 'side-by-side', // or 'line-by-line'
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
