import { ClassicEditor } from "ckeditor5";

export const editorConfig = {
  licenseKey: "GPL",

  toolbar: [
    "undo",
    "redo",
    "|",
    "heading",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "fontSize",
    "fontColor",
    "fontBackgroundColor",
    "|",
    "alignment",
    "|",
    "bulletedList",
    "numberedList",
    "|",
    "insertTable",
    "|",
    "blockQuote",
    "|",
    "link",
  ],

  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
};

export default ClassicEditor;
