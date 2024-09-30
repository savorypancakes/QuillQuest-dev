import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import '../assets/css/components/TextEditor.css'

const TextEditor = ({ translationResult, className = '', editorStyles }) => {
  const [isEmpty, setIsEmpty] = useState(true);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Untitled document',
      }),
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      setIsEmpty(editor.isEmpty);
    },
  })

  useEffect(() => {
    if (editor && translationResult && isEmpty) {
      editor.commands.setContent(`${translationResult}`);
    }
  }, [translationResult, editor, isEmpty]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`text-editor-wrapper ${className}`} style={editorStyles}>
      <EditorContent editor={editor} />
    </div>
  )
}

export default TextEditor;