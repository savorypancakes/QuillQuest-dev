import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import '../assets/css/components/TextEditor.css';

const ErrorHighlight = Extension.create({
  name: 'errorHighlight',

  addGlobalAttributes() {
    return [
      {
        types: ['text'],
        attributes: {
          errorHighlight: {
            default: null,
            parseHTML: element => element.getAttribute('data-error-highlight'),
            renderHTML: attributes => {
              if (!attributes.errorHighlight) {
                return {};
              }
              return {
                'data-error-highlight': attributes.errorHighlight,
                style: 'background-color: rgba(255, 0, 0, 0.2); cursor: pointer;',
              };
            },
          },
        },
      },
    ];
  },
});

const TextEditor = ({ initialContent, onContentChange, errors, className = '', editorStyles }) => {
  const [content, setContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Untitled document',
      }),
      ErrorHighlight,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
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

  useEffect(() => {
    if (editor && errors) {
      editor.view.dispatch(editor.view.state.tr.setMeta('errorHighlight', errors));
    }
  }, [editor, errors]);

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