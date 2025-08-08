import {UserCog} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import type {ProjectMember} from '@/hooks/query/use-project';
import {availableRoles, projectRoleDescMap, projectRoleMap} from '@/lib/data-dictionary';
import {useState} from 'react';
import {toast} from 'sonner';
import {useParams} from 'next/navigation';
import {ProjectRole} from '@repo/shared-types'
import apiClient from "@/lib/axios";

export function ChangeMemberRoleDialog({
                                           member,
                                           open,
                                           setOpen,
                                           refresh
                                       }: {
    member: ProjectMember | null;
    open: boolean;
    setOpen: (open: boolean) => void;
    refresh: () => void;
}) {
    if (!member) {
        return null;
    }
    const [role, setRole] = useState(member.role);
    const {projectId} = useParams();
    const handleSubmit = () => {
        toast.promise(
            apiClient.patch(`/${projectId}/project-member/${member.id}`, {
                role
            }),
            {
                loading: '修改中',
                success: async data => {
                    setOpen(false);
                    refresh();
                    return '操作成功';
                },
                error: error => {
                    return error.response?.data?.error || '操作失败';
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className={'sm:max-w-[400px]'}>
                <div className="mb-2 flex flex-col gap-2">
                    <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                    >
                        <UserCog className="opacity-80" size={20}/>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-left">修改【{member.user.email}】成员权限</DialogTitle>
                    </DialogHeader>
                </div>

                <form className="space-y-5">
                    <RadioGroup
                        className="gap-2"
                        defaultValue={role}
                        onValueChange={value => setRole(value as ProjectRole)}
                    >
                        {availableRoles.map(role => (
                            <div
                                key={role}
                                className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none"
                            >
                                <RadioGroupItem value={role} className="order-1 after:absolute after:inset-0"/>
                                <div className="grid grow gap-1">
                                    <Label> {projectRoleMap[role]}</Label>
                                    <p className="text-muted-foreground text-xs">{projectRoleDescMap[role]}</p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>

                    <div className="flex items-center justify-between">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                取消
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSubmit}>
                            修改
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
