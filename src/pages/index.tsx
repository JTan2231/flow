/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useRef, type RefObject, useEffect } from "react";
import Head from "next/head";
import { api } from "~/utils/api";
import { Decimal, GetResult } from "@prisma/client/runtime";

type Flow = {
  id: number,
  name: string,
  userId: string,
  baseAmount: Decimal,
};

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
            { sessionData?.user !== undefined ? `Logged in as ${sessionData.user.name}` : 'Not logged in' }
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

  const flowCreator = CreateFlow({ userId: sessionData ? sessionData.user.id : "-1" });

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          className="m-1 rounded bg-black px-3 py-1 font-semibold text-white no-underline transition hover:bg-black/80"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>
      { sessionData ? flowCreator : <></> }
    </>
  );
}

function CreateFlow(props: { userId: string }) {
  const initialFlows = api.flow.getAllFlows.useQuery({ userId: props.userId });

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [flowList, setFlowList] = useState([] as Flow[]);
  const [rawNumber, setRawNumber] = useState(true);

  const [inputFlow, setInputFlow] = useState('');

  const { data: sessionData } = useSession();
  const flowMutation = api.flow.createFlow.useMutation();
  const deleteFlowMutation = api.flow.deleteFlow.useMutation();

  const nameInput = useRef() as RefObject<HTMLInputElement>;
  const valueInput = useRef() as RefObject<HTMLInputElement>;
  const flowInput = useRef() as RefObject<HTMLSelectElement>;
  const flowOutput = useRef() as RefObject<HTMLSelectElement>;

  const buttonClass = "flex m-1 rounded-full bg-black px-3 py-1 font-semibold text-white no-underline transition hover:bg-black/80 ";

  useEffect(() => {
    setFlowList(initialFlows.data as Flow[]);
  });

  const createFlowButtonClick = () => {
    const name = nameInput?.current?.value;
    const value = Number(valueInput?.current?.value);

    if (!name || name === '') {
      setError("border-red-500");
      return;
    } else if (isNaN(value)) {
      setError("border-red-500");
      return;
    }

    setError("");

    flowMutation.mutate({
      name: name,
      userId: sessionData!.user.id,
      baseAmount: value,
    });

    setCreating(false);
  };

  const removeFlow = (flowId: number) => {
    return () => {
      setFlowList(flowList.filter(flow => flow.id !== flowId));
      deleteFlowMutation.mutate({ flowId })
    }
  };

  const inputClass = "border border-black rounded p-1 basis-full m-1 " + error;

  return (
    <div>
      { creating ? (
          <div className="m-2 flex flex-row flex-wrap w-32">
            <input className={ inputClass } ref={ nameInput } type="text" placeholder="Name" />
            <span>Input: 
              <select className="p-1" ref={ flowInput }>
                { [<option>None</option>].concat(flowList.map(flow => <option>{ flow.name }</option>)) }
              </select>
            </span>
            { flowInput.current?.value !== 'None' ? <input className={ inputClass } ref={ valueInput } type="text" placeholder="Value" /> : <></> }
            <span>Output: 
              <select className="p-1" ref={ flowOutput }>
                { [<option>None</option>].concat(flowList.map(flow => <option>{ flow.name }</option>)) }
              </select>
            </span>
            { flowInput.current?.value === 'None' && flowOutput.current?.value !== 'None' ? <input className={ inputClass } type="text" placeholder="Value" /> : <></> }
            <span><input type="radio" name="radio" defaultChecked onClick={ () => setRawNumber(true) } /> Raw number</span>
            <span><input type="radio" name="radio" onClick={ () => setRawNumber(false) } /> Portion of</span>
            <div className="flex">
              <button className={ buttonClass } onClick={ () => setCreating(false) }>Cancel</button>
              <button className={ buttonClass } onClick={ createFlowButtonClick }>Save</button>
            </div>
          </div>
        ) : <>
              <button className={ buttonClass } onClick={ () => setCreating(true) }>Create new flow</button>
              <table>
                { flowList ? flowList.map(flow => {
                  return (
                      <tr>
                        <td>
                          <span className="mr-4">{ flow.name }:</span>
                        </td>
                        <td>
                          <span className="mr-4">{ Number(flow.baseAmount) }</span>
                        </td>
                        <td>
                          <button className="rounded border-black border-2 px-2" onClick={ () => deleteFlowMutation.mutate({ flowId: flow.id }) }>Delete</button>
                        </td>
                      </tr>
                  )
                }) : [] }
              </table>
            </>
      }
    </div>
  );
}
