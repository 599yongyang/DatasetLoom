import { Mention, MentionsInput, type SuggestionDataItem } from 'react-mentions';
import React from 'react';
import { stringToColor } from '@/lib/utils';

interface MentionsTextareaProps {
    value: string;
    onChange?: (value: string) => void;
    data?: SuggestionDataItem[];
    readOnly?: boolean;
    placeholder?: string;
    className?: string;
}

export default function MentionsTextarea({
    value,
    onChange,
    data = [],
    readOnly = false,
    placeholder = '输入问题，按@提及其他标注',
    className = ''
}: MentionsTextareaProps) {
    // 自定义提及渲染
    const renderSuggestion = (suggestion: SuggestionDataItem, highlightedDisplay: React.ReactNode) => {
        return (
            <div className="flex items-center gap-2 p-2">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stringToColor(suggestion.display || '') }}
                />
                <span>{suggestion.display}</span>
                <span className="truncate">{highlightedDisplay}</span>
            </div>
        );
    };

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (readOnly) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
        }
    };

    return (
        <div>
            {readOnly ? (
                <MentionsInput
                    value={value}
                    readOnly
                    disabled
                    className={className}
                    style={{
                        highlighter: {
                            padding: 0
                        },
                        input: {
                            padding: 0
                        },
                        suggestions: {
                            display: 'none'
                        }
                    }}
                >
                    <Mention
                        trigger="@"
                        data={[]}
                        markup="@[__display__](__id__)"
                        style={{ backgroundColor: '#a5f3fc' }}
                    />
                </MentionsInput>
            ) : (
                <MentionsInput
                    value={value}
                    onChange={e => onChange?.(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={className}
                    a11ySuggestionsListLabel={'标注区域建议'}
                    style={{
                        control: {
                            fontSize: 14,
                            fontWeight: 'normal'
                        },
                        '&multiLine': {
                            input: {
                                padding: 8,
                                border: '1px solid transparent'
                            }
                        },
                        suggestions: {
                            marginLeft: 20,
                            zIndex: 100,
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }
                    }}
                >
                    <Mention
                        trigger="@"
                        data={data}
                        renderSuggestion={renderSuggestion}
                        markup="@[__display__](__id__)"
                        displayTransform={(id, display) => `@${display}`}
                        style={{ backgroundColor: '#86efac' }}
                        appendSpaceOnAdd={true}
                    />
                </MentionsInput>
            )}
        </div>
    );
}
