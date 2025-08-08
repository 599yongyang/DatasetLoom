import {stringToColor} from '@/lib/utils';
import React from 'react';
import {BACKEND_URL} from "@/constants/config";
import type {ImageWithImageBlock} from "@/types/interfaces";

export default function BlockHighlight({image}: { image: ImageWithImageBlock; }) {
    const {id, url, fileName, ImageBlock: block, width, height} = image;
    return (
        <>
            {/* 主图像 */}
            <img src={`${BACKEND_URL}${url}`} alt={fileName} className="w-full h-full object-contain"/>

            {/* 高亮标注区域 */}
            <div className="absolute inset-0">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                    <defs>
                        <mask id={`highlight-mask-${id}`}>
                            <rect width="100%" height="100%" fill="white"/>
                            {block.map(item => (
                                <rect
                                    key={`mask-${item.id}`}
                                    x={item.x}
                                    y={item.y}
                                    width={item.width}
                                    height={item.height}
                                    fill="black"
                                />
                            ))}
                        </mask>
                    </defs>

                    {/* 暗化背景 */}
                    {block.length && (
                        <rect
                            width="100%"
                            height="100%"
                            fill="rgba(0,0,0,0.5)"
                            mask={`url(#highlight-mask-${id})`}
                        />
                    )}

                    {/* 标注框 */}
                    {block.map(item => (
                        <g key={item.id}>
                            <rect
                                x={item.x}
                                y={item.y}
                                width={item.width}
                                height={item.height}
                                fill={`${stringToColor(item.label, 0.2)}`}
                                stroke={stringToColor(item.label)}
                                strokeWidth="2"
                            />
                            <text
                                x={item.x + 5}
                                y={item.y - 5}
                                fontSize="40"
                                fill={stringToColor(item.label)}
                                fontWeight="bold"
                                className="drop-shadow-md"
                            >
                                {item.label}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </>
    );
}
