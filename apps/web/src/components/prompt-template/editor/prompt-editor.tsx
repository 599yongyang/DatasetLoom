import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
export function PromptEditor({ value, onChange }: { value: string; onChange: any }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        if (typeof window !== 'undefined') {
            // 客户端初始化逻辑
            import('monaco-editor').then(monaco => {
                const { loader } = require('@monaco-editor/react');
                loader.config({ monaco });

                if (!monaco.languages.getLanguages().some(lang => lang.id === 'promptLang')) {
                    monaco.languages.register({ id: 'promptLang' });
                    monaco.languages.setMonarchTokensProvider('promptLang', {
                        tokenizer: {
                            root: [
                                [/\{\{.*?\}\}/, 'variable'],
                                [/[^{]+/, 'text'],
                                [/\{/, 'text']
                            ]
                        }
                    });
                }

                monaco.editor.defineTheme('prompt-theme', {
                    base: 'vs',
                    inherit: true,
                    rules: [
                        { token: 'variable', foreground: '0066cc', fontStyle: 'bold' },
                        { token: 'text', foreground: '333333' }
                    ],
                    colors: {
                        'editor.background': '#ffffff'
                    }
                });
            });
        }
    }, []);

    if (!isMounted) {
        return (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[500px] border border-gray-300 rounded-md p-2"
                placeholder="Loading editor..."
            />
        );
    }

    return (
        <Editor
            height="500px"
            className={'border border-gray-300 rounded-md'}
            language="promptLang"
            theme="prompt-theme"
            value={value}
            onChange={onChange}
            options={{
                minimap: { enabled: false },
                lineNumbers: 'off',
                glyphMargin: false,
                autoClosingBrackets: 'never',
                wordBasedSuggestions: 'off',
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3
            }}
        />
    );
}
