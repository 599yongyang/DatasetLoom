// 'use server';
// 获取标签树
// import { db } from '@/server/db';

// export async function getTags(projectId: string) {
//     try {
//         return await getTagsTreeWithQuestionCount(projectId);
//     } catch (error) {
//         return [];
//     }
// }

// 递归查询树状结构，并统计问题数量
// async function getTagsTreeWithQuestionCount(projectId: string, parentId = null) {
//     // 查询当前层级的分类
//     const tags = await db.tags.findMany({
//         where: { parentId, projectId }
//     });
//
//     // 遍历每个分类，递归查询子节点
//     for (const tag of tags) {
//         // 获取当前分类及其子分类的所有 label
//         const labels = await getAllLabels(tag.id);
//
//         // 统计当前分类及其子分类的问题数量
//         tag.questionCount = await db.questions.count({
//             where: { label: { in: labels }, projectId }
//         });
//
//         // 递归查询子节点
//         tag.child = await getTagsTreeWithQuestionCount(projectId, tag.id);
//     }
//
//     return tags;
// }

// // 获取某个分类及其所有子分类的 label
// async function getAllLabels(tagId: string) {
//     const labels = [];
//     const queue = [tagId];
//
//     while (queue.length > 0) {
//         const currentId = queue.shift();
//         const tag = await db.tags.findUnique({
//             where: { id: currentId }
//         });
//
//         if (tag) {
//             labels.push(tag.label);
//             // 获取子分类的 ID，加入队列
//             const children = await db.tags.findMany({
//                 where: { parentId: currentId },
//                 select: { id: true }
//             });
//             queue.push(...children.map(child => child.id));
//         }
//     }
//
//     return labels;
// }
//
// export async function createTag(projectId: string, label: string, parentId: string) {
//     try {
//         let data = {
//             projectId,
//             label,
//             parentId
//         };
//         if (parentId) {
//             data.parentId = parentId;
//         }
//         return await db.tags.create({ data });
//     } catch (error) {
//         console.error('Error insert tags db:', error);
//         throw error;
//     }
// }
//
// export async function updateTag(label: string, id: string) {
//     try {
//         return await db.tags.update({ where: { id }, data: { label } });
//     } catch (error) {
//         console.error('Error update tags db:', error);
//         throw error;
//     }
// }
//
// export async function deleteTag(id: string) {
//     try {
//         return await db.tags.delete({ where: { id } });
//     } catch (error) {
//         console.error('Error update tags db:', error);
//         throw error;
//     }
// }
//
// // 保存整个标签树
// export async function batchSaveTags(projectId: string, tags: any[]) {
//     try {
//         await insertTags(projectId, tags);
//     } catch (error) {
//         console.error('Error insert tags db:', error);
//         throw error;
//     }
// }
//
// async function insertTags(projectId: string, tags: any[], parentId: string | null = null) {
//     for (const tag of tags) {
//         // 插入当前节点
//         const createdTag = await db.tags.create({
//             data: {
//                 projectId,
//                 label: tag.label,
//                 parentId: parentId
//             }
//         });
//         // 如果有子节点，递归插入
//         if (tag.child && tag.child.length > 0) {
//             await insertTags(projectId, tag.child, createdTag.id);
//         }
//     }
// }
