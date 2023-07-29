/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useRef, type RefObject } from 'react';
import Head from 'next/head';
import { api } from '~/utils/api';
import { Flow, Connection } from '~/schema/flow';
import { CheckboxDropdown } from '~/components/dropdown';
import { FlowDashboard } from '~/components/flow_dashboard';

const SELECT_DEFAULT = 'None';

export default function Home() {
    const { data: sessionData } = useSession();

    return (
        <>
            <Head>
                <title>Flow</title>
                <meta name="description" content="Financial planning app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div>
                    <h1>
                        {sessionData?.user !== undefined ? `Logged in as ${sessionData.user.name}` : 'Not logged in'}
                    </h1>
                    <div>
                        <AuthShowcase />
                    </div>
                </div>
            </main>
        </>
    );
}

function AuthShowcase() {
    const { data: sessionData } = useSession();

    const flowCreator = CreateFlow({ userId: sessionData ? sessionData.user.id : '-1' });

    return (
        <>
            <div className="flex items-center gap-4">
                <button
                    className="m-1 rounded bg-black px-3 py-1 font-semibold text-white no-underline transition hover:bg-black/80"
                    onClick={sessionData ? () => void signOut() : () => void signIn()}
                >
                    {sessionData ? 'Sign out' : 'Sign in'}
                </button>
            </div>
            {sessionData ? flowCreator : <></>}
        </>
    );
}

function CreateFlow(props: { userId: string }) {
    const { data: allFlows, error: err } = api.flow.getAllFlows.useQuery({ userId: props.userId });

    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [flowList, setFlowList] = useState([] as Flow[]);

    const [inputFlows, setInputFlows] = useState([] as Connection[]);
    const [interval, setInterval] = useState(0);

    const { data: sessionData } = useSession();

    const deleteFlowMutation = api.flow.deleteFlow.useMutation();
    const unconnectedFlowMutation = api.flow.createFlow.useMutation();
    const connectedFlowMutation = api.flow.createConnectedFlow.useMutation();

    const nameInput = useRef() as RefObject<HTMLInputElement>;
    const valueInput = useRef() as RefObject<HTMLInputElement>;
    const flowInput = useRef() as RefObject<HTMLSelectElement>;

    const buttonClass =
        'flex m-1 rounded-full bg-black px-3 py-1 font-semibold text-white no-underline transition hover:bg-black/80 ';

    const mapFlowQueryData = (flows: any[] | undefined) => {
        return flows!.map(
            (flow: Flow) =>
                ({
                    id: flow.id,
                    name: flow.name,
                    userId: flow.userId,
                    dollarAmount: flow.dollarAmount,
                    percentAmount: flow.percentAmount,
                    inputFlows: flow.inputFlows,
                    outputFlows: flow.outputFlows,
                } as Flow)
        );
    };

    const inputFlowCallback = (selection: Connection[]) => {
        setInputFlows(selection);
    };

    const createFlowButtonClick = () => {
        const name = nameInput?.current?.value;
        const value = Number(valueInput?.current?.value);

        if (!name || name === '') {
            setError('border-red-500');
            return;
        } else if (isNaN(value)) {
            setError('border-red-500');
            return;
        }

        setError('');

        let newFlow = {
            name: name,
            userId: sessionData!.user.id,
            interval: interval,
            dollarAmount: value,
            percentAmount: 0,
            inputConnections: inputFlows,
        };

        if (newFlow.inputConnections.length > 0) {
            connectedFlowMutation.mutate(newFlow);
        } else {
            unconnectedFlowMutation.mutate(newFlow);
        }

        setCreating(false);
    };

    const removeFlow = (flowId: number) => {
        return () => {
            setFlowList(flowList.filter((flow) => flow.id !== flowId));
            deleteFlowMutation.mutate({ flowId });
        };
    };

    const inputClass = 'border border-black rounded p-1 basis-full m-1 ' + error;

    console.log(allFlows);

    return (
        <div>
            {creating ? (
                <div className="m-2 flex w-32 flex-row flex-wrap">
                    <input className={inputClass} ref={nameInput} type="text" placeholder="Name" />
                    Source:
                    <CheckboxDropdown
                        itemList={mapFlowQueryData(allFlows)}
                        selectionCallback={inputFlowCallback}
                        input={true}
                    />
                    {!flowInput.current || flowInput.current?.value === SELECT_DEFAULT ? (
                        <input className={inputClass} ref={valueInput} type="text" placeholder="Dollar amount" />
                    ) : (
                        <></>
                    )}
                    <span className="flex">
                        Interval:&nbsp;
                        <select>
                            <option onClick={() => setInterval(0)}>Day</option>
                            <option onClick={() => setInterval(1)}>Week</option>
                            <option onClick={() => setInterval(2)}>Month</option>
                            <option onClick={() => setInterval(3)}>Year</option>
                        </select>
                    </span>
                    <div className="flex">
                        <button className={buttonClass} onClick={() => setCreating(false)}>
                            Cancel
                        </button>
                        <button className={buttonClass} onClick={createFlowButtonClick}>
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <FlowDashboard
                    allFlows={allFlows ? allFlows : []}
                    setCreatingCallback={() => setCreating(true)}
                    removeFlow={(id: number) => removeFlow(id)}
                />
            )}
        </div>
    );
}
