// src/Tiptap.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder' // Import the placeholder extension
import '../assets/css/components/TextEditor.css' // Assuming you have styles in this file

const TextEditor = () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Untitled document', // Set your placeholder text here
      }),
    ],
    content: '', // Start with empty content
  })

  if (!editor) {
    return null // Render nothing if editor is not ready
  }

  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}

export default TextEditor
