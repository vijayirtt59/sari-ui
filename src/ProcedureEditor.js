import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

function ProcedureEditor({
  value,
  onChange,
}) {

  const editor = useEditor({
    extensions: [
      StarterKit,

      Table.configure({
        resizable: true,
      }),

      TableRow,
      TableCell,
      TableHeader,
    ],

    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="mb-2">

        <button
          className="btn btn-sm btn-outline-secondary me-1"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          Bold
        </button>

        <button
          className="btn btn-sm btn-outline-secondary me-1"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          Italic
        </button>

        <button
          className="btn btn-sm btn-outline-secondary me-1"
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          Bullet
        </button>

        <button
          className="btn btn-sm btn-outline-secondary me-1"
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          Numbered
        </button>

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({
                rows: 3,
                cols: 3,
                withHeaderRow: true,
              })
              .run()
          }
        >
          Table
        </button>

      </div>

      <EditorContent
        editor={editor}
        className="border p-3 bg-white"
      />
    </>
  );
}

export default ProcedureEditor;