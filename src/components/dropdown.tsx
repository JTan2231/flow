import { useState, useEffect } from 'react';
import { Flow, Connection, newConnection } from '~/schema/flow';

export function CheckboxDropdown(props: {
    itemList: Flow[];
    selectionCallback: (list: Connection[]) => void;
    input: boolean;
}) {
    const [itemList, setItemList] = useState([] as Flow[]);
    const [selectionList, setSelectionList] = useState([] as boolean[]);
    const [radioList, setRadioList] = useState([] as string[]);

    const [itemsOptionsList, setItemsOptionsList] = useState([] as any[]);
    const [connectionsList, setConnectionsList] = useState([] as Connection[]);

    const [initialized, setInitialized] = useState(false);

    const inputClass =
        'border-[1px] border-transparent border-b-black focus:border-black outline outline-0 focus:outline-0 p-1 basis-full m-1';

    useEffect(() => {
        setItemList(props.itemList);

        if (!initialized) {
            const selections: boolean[] = [];
            const radio: string[] = [];
            const connections: Connection[] = [];

            for (let i = 0; i < props.itemList.length; i++) {
                selections.push(false);
                radio.push('raw');

                const conn = newConnection();
                if (props.input) {
                    conn.inputFlowId = props.itemList[i]!.id;
                } else {
                    conn.outputFlowId = props.itemList[i]!.id;
                }

                connections.push(conn);
            }

            setSelectionList(selections);
            setRadioList(radio);
            setConnectionsList(connections);
            setInitialized(true);
        }
    }, [props.itemList]);

    const createSelectCallback = (index: number) => {
        return (event: any) => {
            const backgroundColor = 'bg-blue-500';
            if (event.target.classList.contains(backgroundColor)) {
                event.target.classList.remove(backgroundColor);
            } else {
                event.target.classList.add(backgroundColor);
            }

            console.log('before', index, selectionList);

            let newList = selectionList;
            newList[index] = !newList[index];

            console.log('after', index, newList);

            setSelectionList(newList);
            props.selectionCallback(connectionsList.filter((_, index) => selectionList[index]));
            setItemsOptionsList(
                itemList.map((_, index) =>
                    newList[index] ? (
                        <div className="flex">
                            <div className="ml-4 h-9 w-32 text-sm">
                                <div>
                                    <input
                                        type="radio"
                                        name={'radio' + index}
                                        defaultChecked
                                        onClick={createRadioSetter(index, 'raw')}
                                    />{' '}
                                    In addition to
                                </div>
                                <div>
                                    <input
                                        type="radio"
                                        name={'radio' + index}
                                        onClick={createRadioSetter(index, 'percent')}
                                    />{' '}
                                    Percent of
                                </div>
                            </div>
                            <div className="h-9">
                                <input
                                    className={inputClass}
                                    type="text"
                                    onChange={createInputOnChange(index)}
                                    placeholder="Amount"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="ml-4 h-9 w-32 bg-white text-sm" />
                    )
                )
            );
        };
    };

    const createRadioSetter = (index: number, value: string) => {
        return () => {
            let newList = radioList;
            newList[index] = value;
            setRadioList(newList);
        };
    };

    const createInputOnChange = (index: number) => {
        return (event: any) => {
            const value = Number(event.target.value);
            if (isNaN(value)) {
                return;
            }

            let newList = connectionsList;
            if (radioList[index] === 'raw') {
                newList[index]!.percentAmount = 0;
                newList[index]!.dollarAmount = value;
            } else if (radioList[index] === 'percent') {
                newList[index]!.percentAmount = value;
                newList[index]!.dollarAmount = 0;
            }

            setConnectionsList(newList);
        };
    };

    return (
        <div className="flex">
            <span className="max-h-sm min-w-[8rem] max-w-md border-2 border-black text-lg ">
                {itemList.map((item, index) => (
                    <div
                        key={index}
                        className="h-9 cursor-pointer select-none p-1"
                        onClick={(e) => createSelectCallback(index)(e)}
                    >
                        {item.name}
                    </div>
                ))}
            </span>
            <span>{itemsOptionsList}</span>
        </div>
    );
}
