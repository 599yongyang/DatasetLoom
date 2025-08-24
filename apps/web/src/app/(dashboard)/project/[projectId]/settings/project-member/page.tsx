'use client';

import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetProjectMember, type ProjectMember } from '@/hooks/query/use-project';
import { Button } from '@/components/ui/button';
import React, { useEffect, useMemo, useState } from 'react';
import { projectRoleColorMap, projectRoleMap } from '@/constants/data-dictionary';
import { Badge } from '@/components/ui/badge';
import { ProjectMemberDialog } from '@/components/settings/member/add-dialog';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ChangeMemberRoleDialog } from '@/components/settings/member/change-dialog';
import { getSession, UserInfo } from '@/lib/session';
import PaginationC from '@/components/ui/pagination';
import apiClient from '@/lib/axios';
import { useDebounce } from '@/hooks/use-debounce';
import { usePagination } from '@/hooks/use-pagination';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const [inputValue, setInputValue] = useState('');
    const searchQuery = useDebounce(inputValue, 300);

    const { pagination, setPagination } = usePagination({
        defaultPageSize: 10,
        resetDeps: [searchQuery]
    });

    const { data: projectMember, total, refresh } = useGetProjectMember({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize, query: searchQuery
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [member, setMember] = useState<ProjectMember | null>(null);
    const [changeRoleOpen, setChangeRoleOpen] = useState(false);

    const handleDeleteMember = async (memberId: string) => {
        toast.promise(apiClient.delete(`/${projectId}/project-member/${memberId}`), {
            loading: '删除中...',
            success: async () => {
                void refresh();
                return '删除成功';
            },
            error: e => e.response?.data?.message || '删除失败'
        });
    };

    useEffect(() => {
        getSession().then(session => {
            setCurrentUser(session?.user || null);
        });
    }, []);

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 s flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input
                        className="w-1/3"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder={'搜索用户'}
                    />
                </div>
                <div className={'flex items-center gap-2'}>
                    <Button onClick={() => setOpen(true)}>添加新成员</Button>
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted sticky top-0 z-10">
                            <TableHead className={'w-80'}>昵称</TableHead>
                            <TableHead className={'w-80'}>邮箱</TableHead>
                            <TableHead>权限</TableHead>
                            <TableHead>加入时间</TableHead>
                            <TableHead className="text-center">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {projectMember.map(member => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage
                                                src={`/api/view/avatar/${member.user.id}`}
                                                alt={member.user.name}
                                            />
                                            <AvatarFallback>
                                                {' '}
                                                {member.user.name?.slice(0, 1).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {member.user.name}
                                    </div>
                                </TableCell>
                                <TableCell>{member.user.email}</TableCell>
                                <TableCell>
                                    <Badge className={projectRoleColorMap[member.role]}>
                                        {projectRoleMap[member.role]}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(member.joinedAt).toLocaleString('zh-CN')} </TableCell>
                                <TableCell className="text-center">
                                    {currentUser?.email !== member.user.email && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    setMember(member);
                                                    setChangeRoleOpen(true);
                                                }}
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Edit />
                                            </Button>
                                            <ConfirmAlert
                                                title={`确认要删除此【${member.user.name}】项目成员？`}
                                                message={'此操作不可逆，请谨慎操作！'}
                                                onConfirm={() => handleDeleteMember(member.id)}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-red-500"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </ConfirmAlert>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <PaginationC pagination={pagination} setPagination={setPagination} pageCount={pageCount} />
            {open && <ProjectMemberDialog open={open} setOpen={setOpen} refresh={refresh} />}
            {changeRoleOpen && (
                <ChangeMemberRoleDialog
                    open={changeRoleOpen}
                    setOpen={setChangeRoleOpen}
                    member={member}
                    refresh={refresh}
                />
            )}
        </div>
    );
}
