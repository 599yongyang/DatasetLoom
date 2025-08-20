import { PromptTemplateType } from '@repo/shared-types';

export const InitPromptTemplate = [
    {
        name: '生成答案（系统默认）',
        description: '这是系统默认生成答案的prompt',
        type: PromptTemplateType.ANSWER,
        content: `# 角色使命
你是一位专业的文档分析师和知识工程师，擅长从复杂文本中提取关键信息并生成高质量答案。
    
## 上下文
{{context}}

## 问题
{{question}}

## 输入说明
- 输出语言: {{outputLanguage}}
- 答案风格: {{style}}
- 详细程度: {{detailLevel}}

### 生成要求
1. **严格基于上下文**
   - 禁止编造任何未提及的信息
   - 答案必须完全来源于上下文
   - 若上下文无法支持问题，请返回错误提示

2. **格式规范**
   - 使用{{outputLanguage}}回答
   - 按照指定风格和详细程度组织答案

3. **结构要求**
   - 先给出直接答案
   - 然后提供支持证据
   - 最后可补充相关延伸（必须在上下文中有依据）

`,
        variables: {
            'outputLanguage': {
                'name': 'outputLanguage',
                'type': 'select',
                'defaultValue': '',
                'description': '输出语言',
                'required': false,
                'options': [{ 'label': '中文', 'value': '中文' }, { 'label': '英文', 'value': '英文' }]
            },
            'style': {
                'name': 'style',
                'type': 'select',
                'defaultValue': '',
                'description': '答案风格',
                'required': false,
                'options': [{
                    'label': '直接给出问题的核心答案',
                    'value': '直接给出问题的核心答案'
                }, {
                    'label': '提供完整的推理过程和依据',
                    'value': '提供完整的推理过程和依据'
                }, {
                    'label': '以分步形式逐步解答',
                    'value': '以分步形式逐步解答'
                }, { 'label': '提供背景说明与延伸解释', 'value': '提供背景说明与延伸解释' }]
            },
            'detailLevel': {
                'name': 'detailLevel',
                'type': 'select',
                'defaultValue': '',
                'description': '详细程度',
                'required': false,
                'options': [{
                    'label': '1-2句话，只包含核心答案',
                    'value': '1-2句话，只包含核心答案'
                }, {
                    'label': '3-5句话，包含主要证据与结论',
                    'value': '3-5句话，包含主要证据与结论'
                }, { 'label': '完整段落，包含背景、证据、推理与结论', 'value': '完整段落，包含背景、证据、推理与结论' }]
            }
        }
    },
    {
        name: '生成问题（系统默认）',
        description: '这是系统默认生成问题的prompt',
        type: PromptTemplateType.QUESTION,
        content: `# 角色定位
你是一位专业的知识工程师，专精于从技术文档中提取核心概念并生成高质量的训练问答对

## 待分析文本
{{context}}

## 文本分析参数
- 目标问题数：{{count}} 个
- 难度配置：{{difficulty}}
- 风格适配：{{style}}
- 目标受众：{{audience}}
- 输出语言：{{outputLanguage}}
## 生成策略

### 1. 信息提取优先级
**高优先级概念**：定义、原理、架构、流程、关键数据
**中优先级概念**：特性、优势、应用场景、对比分析  
**低优先级概念**：举例说明、背景信息、补充细节

### 2. 问题类型分布控制
按{{ratio}}比例生成：
- **事实询问型**：核心概念的定义、组成要素、基本特征
- **逻辑推理型**：因果关系、工作原理、影响机制
- **应用分析型**：使用场景、解决方案、实践建议

### 3. 质量控制标准
**必须满足**：
- 答案在原文中有明确依据
- 问题表述清晰无歧义
- 避免是非题和过于简单的选择
- 专业术语使用准确

**避免生成**：
- 需要额外背景知识才能回答
- 涉及具体数字但原文未明确给出
- 过于宽泛或开放式的主观问题
- 重复概念的不同表述

### 生成步骤
1. **内容解析**：识别关键概念和信息层次
2. **候选生成**：创建{{count}}*2个候选问题
3. **质量筛选**：应用过滤标准和去重机制
4. **最终输出**：精选{{count}}个最佳问答对

`,
        variables: {
            'difficulty': {
                'name': 'difficulty',
                'type': 'select',
                'defaultValue': '',
                'description': '难度',
                'required': false,
                'options': [{ 'label': '基础事实性', 'value': '基础事实性' }, {
                    'label': '中等推理性',
                    'value': '中等推理性'
                }, { 'label': '高阶开放性', 'value': '高阶开放性' }]
            },
            'style': {
                'name': 'style',
                'type': 'select',
                'defaultValue': '',
                'description': '输出风格',
                'required': false,
                'options': [{ 'label': '中性', 'value': '中性' }, {
                    'label': '学术研究者',
                    'value': '学术研究者'
                }, { 'label': '科普作者', 'value': '科普作者' }, {
                    'label': '对话体（家长/学生）',
                    'value': '对话体（家长/学生）'
                }, { 'label': '故事叙述者', 'value': '故事叙述者' }]
            },
            'audience': {
                'name': 'audience',
                'type': 'text',
                'defaultValue': '',
                'description': '受众对象',
                'required': false
            },
            'ratio': {
                'name': 'ratio',
                'type': 'text',
                'defaultValue': '7:2:1',
                'description': '问题分布控制',
                'required': false
            },
            'outputLanguage': {
                'name': 'outputLanguage',
                'type': 'select',
                'defaultValue': '',
                'description': '输出语言',
                'required': false,
                'options': [{ 'label': '中文', 'value': '中文' }, { 'label': '英文', 'value': '英文' }]
            },
            'count': {
                'name': 'count',
                'type': 'number',
                'defaultValue': '',
                'description': '生成数量',
                'required': false,
                'step': 1
            }
        }
    },
    {
        name: '生成图谱（系统默认）',
        description: '这是系统默认生成图谱的prompt',
        type: PromptTemplateType.LABEL,
        content: `# 角色使命
你是一个专业的文档分析师，擅长从复杂文本中提取关键信息，并生成可用于知识图谱构建的结构化元数据。

## 待处理文本
{{context}}

## 分类体系参考
- 科技
  - 软件工程
  - 网络安全
  - 人工智能
  - 数据库
  - 系统架构
- 医疗
- 法律
- 教育
- 金融
`,
        variables: {}
    }
];
