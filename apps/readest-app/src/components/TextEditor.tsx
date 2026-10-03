import clsx from 'clsx';
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  spellCheck?: boolean;
  disabled?: boolean;
  maxRows?: number;
  minRows?: number;
}

export interface TextEditorRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  getElement: () => HTMLTextAreaElement | null;
}

const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onSave,
      onEscape,
      placeholder,
      className,
      autoFocus = false,
      spellCheck = false,
      disabled = false,
      maxRows,
      minRows = 1,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      blur: () => {
        editorRef.current?.blur();
      },
      getValue: () => {
        return editorRef.current?.value || '';
      },
      setValue: (newValue: string) => {
        if (editorRef.current) {
          editorRef.current.value = newValue;
          adjustHeight();
        }
      },
      getElement: () => editorRef.current,
    }));

    useEffect(() => {
      if (autoFocus && editorRef.current) {
        editorRef.current.focus();
      }
    }, [autoFocus]);

    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.value = value;
        adjustHeight();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const adjustHeight = () => {
      if (editorRef.current) {
        editorRef.current.style.height = 'auto';
        const scrollHeight = editorRef.current.scrollHeight;

        let maxHeight = Infinity;
        if (maxRows) {
          const lineHeight = parseInt(getComputedStyle(editorRef.current).lineHeight, 10) || 20;
          maxHeight = lineHeight * maxRows;
        }

        const lineHeight = parseInt(getComputedStyle(editorRef.current).lineHeight, 10) || 20;
        const minHeight = lineHeight * minRows;

        const finalHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        editorRef.current.style.height = `${finalHeight}px`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSave) {
        e.preventDefault();
        onSave();
        return;
      }
    };

    return (
      <textarea
        ref={editorRef}
        className={clsx(
          // M3 Multi-line Input Base Typography & Insets
          'w-full resize-none bg-transparent text-sm leading-relaxed outline-none transition-colors duration-150',
          'text-neutral-900 placeholder:text-neutral-500/60 dark:text-neutral-100 dark:placeholder:text-neutral-400/50',
          'border-0 p-0 focus:outline-none focus:ring-0',
          disabled && 'cursor-not-allowed opacity-40',
          className,
        )}
        dir='auto'
        rows={minRows}
        spellCheck={spellCheck}
        disabled={disabled}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || ''}
      />
    );
  },
);

TextEditor.displayName = 'TextEditor';

export default TextEditor;