
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered 
} from 'lucide-react';

import { Button } from "@/components/ui/button";

interface EditableProposalProps {
  content: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
}

const EditableProposal: React.FC<EditableProposalProps> = ({
  content,
  onChange,
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // disable to use our own configured version
      }),
      Bold,
      Italic,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  
  if (!editor) {
    return null;
  }

  if (readOnly) {
    return (
      <div className="prose prose-blue max-w-none">
        <EditorContent editor={editor} className="min-h-[300px] p-0 outline-none" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b mb-4 py-2 sticky top-0 z-10">
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-100' : ''}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-100' : ''}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-100' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-100' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="prose prose-blue max-w-none">
        <EditorContent editor={editor} className="min-h-[300px] focus:outline-none" />
      </div>
    </div>
  );
};

export default EditableProposal;
