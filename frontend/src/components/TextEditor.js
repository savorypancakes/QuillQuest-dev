// src/components/TextEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import '../assets/css/components/TextEditor.css'

const TextEditor = ({ content, className = '', onUpdate }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Untitled document',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onUpdate && onUpdate(editor.getHTML());
    },
  })

  if (!editor) {
    return null;
  }

  return (
    <div className={`text-editor-wrapper ${className}`}>
      <EditorContent editor={editor} />
    </div>
  )
}

export default TextEditor;