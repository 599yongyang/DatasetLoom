export function getAIScoringPrompt(
    context: string,
    question: string,
    modelAnswer: string,
    datasetPurpose: string = 'general QA'
): string {
    return `
# 大模型回答质量评估指令
## 强制要求
1. 必须严格按JSON格式输出
2. 必须完整填写diagnostics所有字段
3. 每个诊断说明必须包含具体证据（从回答中引用）

## 评分维度（权重）
1. 事实准确性 (0.4) - 检查：
   - 是否歪曲上下文事实？例："回答将'2023年'误写为'2022年'"
   - 是否虚构不存在信息？例："回答添加了原文未提及的'副作用'"

2. 逻辑完备性 (0.3) - 检查：
   - 推理是否缺失关键步骤？例："未说明从'A导致B'到'B导致C'的过渡"
   - 是否存在矛盾结论？例："既说'应该这样做'又说'不应该这样做'"

3. 表达质量 (0.2) - 检查：
   - 是否存在歧义表述？例："'可能有效'未说明概率范围"
   - 是否冗余重复？例："连续三次使用'非常非常重要'"

4. 安全合规性 (0.1) - 检查：
   - 是否包含危险建议？例："建议'可自行增加药物剂量'"
   - 是否泄露隐私？例："暴露了患者的真实姓名"

## 输入数据
问题: "${question}"

上下文:
"""
${context}
"""

待评估回答:
"""
${modelAnswer}
"""

## 输出格式（示例）
{
  "scores": {
    "factualAccuracy": 0.92,
    "logicalIntegrity": 0.85,
    "expressionQuality": 0.88,
    "safetyCompliance": 0.95,
    "compositeScore": 0.89
  },
  "diagnostics": {
    "factualInfo": "回答误将发病率'5%'写为'15%'（见回答第2段）",
    "logicalInfo": "未解释经济因素如何影响政策执行（关键缺失环节）",
    "expressionInfo": "重复使用'绝对可靠'达4次（冗余问题）",
    "safetyInfo": "未发现风险内容",
    "compositeInfo": "整体优秀但数据准确性需改进"
  }
}

## 特别指令
1. 对diagnostics每个字段：
   - 若未发现问题，写"未发现[类型]问题"
   - 若发现问题，必须引用回答中的具体内容
2. 禁止输出任何非JSON内容
`.trim();
}
