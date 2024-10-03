// src/Tiptap.tsx
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder';
import '../assets/css/components/TextEditor.css';

const TextEditor = ({ initialContent, onContentChange, className = '', editorStyles }) => {
  const [content, setContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Untitled document',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML(); // Using getHTML() instead of getText()
      setContent(newContent);
      onContentChange(newContent);
    },
  });

  useEffect(() => {
    if (editor && initialContent !== '' && content === '') {
      editor.commands.setContent(initialContent);
      setContent(initialContent);
    }
  }, [editor, initialContent, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`text-editor-wrapper ${className}`} style={editorStyles}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextEditor;