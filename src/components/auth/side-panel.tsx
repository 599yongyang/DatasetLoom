import { motion } from 'framer-motion';
import { BoxReveal } from '../ui/box-reveal';

export function AuthSidePanel() {
    return (
        <div className="hidden lg:flex items-center justify-center bg-[#242424] p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#c1ff72] blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#c1ff72] blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg relative z-10"
            >
                <BoxReveal boxColor={'#c1ff72'} duration={0.6}>
                    <h1 className="text-5xl font-bold leading-tight text-[#c1ff72]">
                        Dataset <span className="text-white">Loom.</span>
                    </h1>
                </BoxReveal>

                <BoxReveal boxColor={'#c1ff72'} duration={0.6}>
                    <h2 className="mt-4 text-xl text-white/90">
                        面向 <span className="font-semibold text-[#c1ff72]">LLM 数据集构建</span> 的专业工具
                    </h2>
                </BoxReveal>

                <BoxReveal boxColor={'#c1ff72'} duration={0.6}>
                    <div className="mt-8 space-y-4 text-lg leading-relaxed text-white/90">
                        <p className="flex items-start">
                            <span className="mr-2 text-[#c1ff72]">→</span>
                            <span>
                                构建支持 <span className="font-semibold text-[#c1ff72]">监督微调</span>、{' '}
                                <span className="font-semibold text-[#c1ff72]">偏好标注</span>、{' '}
                                <span className="font-semibold text-[#c1ff72]">多轮对话</span> 的训练数据
                            </span>
                        </p>
                        <p className="flex items-start">
                            <span className="mr-2 text-[#c1ff72]">→</span>
                            <span>
                                支持 <span className="font-semibold text-[#c1ff72]">AI 辅助评分</span> 与{' '}
                                <span className="font-semibold text-[#c1ff72]">模型对齐训练</span>
                            </span>
                        </p>
                        <p className="flex items-start">
                            <span className="mr-2 text-[#c1ff72]">→</span>
                            <span>
                                完整流程: <span className="font-semibold text-[#c1ff72]">文档上传</span> →{' '}
                                <span className="font-semibold text-[#c1ff72]">问题生成</span> →{' '}
                                <span className="font-semibold text-[#c1ff72]">答案生成</span> →{' '}
                                <span className="font-semibold text-[#c1ff72]">导出训练数据</span>
                            </span>
                        </p>
                    </div>
                </BoxReveal>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 flex justify-center"
                >
                    <div className="h-1 w-24 rounded-full bg-[#c1ff72]/30" />
                </motion.div>
            </motion.div>
        </div>
    );
}
