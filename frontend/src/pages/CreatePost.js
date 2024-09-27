import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import TextEditor from '../components/TextEditor';
import 'bootstrap/dist/css/bootstrap.css';

const CreatePost = () => {
  return (
    <div className='container-fluid'>
      <div className='row'>
        <div className='col-1'>
          <h1>button</h1>
        </div>
        <div className='col-7'>
          <div className='formGroup mt-4'>
            <input type="text" class="form-control  fs-4 fw-bold" id="title" aria-describedby="emailHelp" placeholder="Untitled document" />  
            {/* <input type="text" class="form-control border-0 shadow-none fs-4 fw-bold" id="title" aria-describedby="emailHelp" placeholder="Untitled document" />   */}
          </div>
          <TextEditor />
        </div>
        <div className='col-4'>
          <h1>button</h1>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;