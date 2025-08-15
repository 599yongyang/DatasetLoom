import Editor from '@monaco-editor/react';

export function PromptEditor({ value, onChange }: { value: string; onChange: any }) {
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
            beforeMount={(monacoInstance) => {
                // 防止重复注册
                if (!monacoInstance.languages.getLanguages().some(lang => lang.id === 'promptLang')) {
                    monacoInstance.languages.register({ id: 'promptLang' });

                    monacoInstance.languages.setMonarchTokensProvider('promptLang', {
                        tokenizer: {
                            root: [
                                [/\{\{.*?\}\}/, 'variable'],
                                [/[^{]+/, 'text'],
                                [/\{/, 'text']
                            ]
                        }
                    });
                }

                if (!monacoInstance.editor.defineTheme) return;
                try {
                    monacoInstance.editor.defineTheme('prompt-theme', {
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
                } catch (e) {
                }
            }}
        />
    );
}
