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
        types: ['textStyle'],
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
      // Clear previous error marks
      editor.commands.unsetAllMarks();

      // Apply new error marks
      errors.forEach(error => {
        editor.chain()
          .focus()
          .setTextSelection({ from: error.offset, to: error.offset + error.length })
          .setMark('textStyle', { errorHighlight: JSON.stringify(error) })
          .run();
      });

      // Reset selection to end of document
      editor.commands.setTextSelection(editor.state.doc.content.size);
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