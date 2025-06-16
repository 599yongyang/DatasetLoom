import { useState } from 'react';

export function useInputList(initialValue: string[]) {
    const [list, setList] = useState<string[]>(initialValue);

    const add = () => setList([...list.filter(url => url !== ''), '']);
    const remove = (index: number) => setList(list.filter((_, i) => i !== index));
    const update = (index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setList(newList);
    };

    return { list, add, remove, update };
}
