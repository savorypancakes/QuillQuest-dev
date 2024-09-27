import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

const TextEditor = () => {
  const [value, setValue] = useState('');
  
  return (
    <ReactQuill value={value} onChange={setValue} />
  );
};

export default TextEditor;
