// src/Tiptap.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder'; // Import the placeholder extension
import '../assets/css/components/TextEditor.css'; // Assuming you have styles in this file
import React, { useState , useEffect } from 'react'

const TextEditor = ({ initialContent, onContentChange, className = '', editorStyles }) => {
  
  const [content, setContent] = useState(initialContent);
  
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Untitled document', // Set your placeholder text here
      }),
    ],
    content: content, // Start with empty content
    onUpdate: ({ editor }) => {
      const newContent = editor.getText();
      setContent(newContent);
      onContentChange(newContent);
    },
  })
  
  useEffect(() => {
    if (editor && initialContent !== '' && content === '') {
      editor.commands.setContent(initialContent);
      setContent(initialContent);
    }
  }, [editor, initialContent, content]);
  
  if (!editor) {
    return null // Render nothing if editor is not ready
  }

  return (
    <div className={`text-editor-wrapper ${className}`} style={editorStyles}>
      <EditorContent editor={editor} />
    </div>
  )
}

export default TextEditor
