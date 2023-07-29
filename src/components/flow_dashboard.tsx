import { useState, useEffect } from 'react';

type DashboardConnection = {
    id: number;
    dollarAmount: number;
    percentAmount: number;
    inputFlowId: number;
    outputFlowId: number;
};

type DashboardFlow = {
    id: number;
    name: string;
    userId: string;
    interval: number;
    dollarAmount: number;
    percentAmount: number;
    calculatedValue: number | null;
    inputConnections: DashboardConnection[];
    outputConnections: DashboardConnection[];
};

// for conversion between time intervals
const intervalMat = [
    [1, 7, 30, 365],
    [1 / 7, 1, 4, 52],
    [1 / 30, 1 / 4, 1, 12],
    [1 / 365, 1 / 52, 1 / 12, 1],
];

export function FlowDashboard(props: {
    allFlows: any[];
    setCreatingCallback: () => void;
    removeFlow: (id: number) => any;
}) {
    const buttonClass =
        'flex m-1 rounded-full bg-black px-3 py-1 font-semibold text-white no-underline transition hover:bg-black/80 ';

    const [calculatedFlows, setFlows] = useState([] as DashboardFlow[]);
    const [interval, setInterval] = useState(0);
    const [flowIdMap, setIdMap] = useState(new Map<number, DashboardFlow>());

    const calculateFlow = (idMap: Map<number, DashboardFlow>, flowId: number) => {
        const backlog: [number, number][] = [];
        backlog.push([flowId, 0]);

        while (backlog.length !== 0) {
            const [currentId, connIndex] = backlog.pop()!;
            const current = idMap.get(currentId)!;
            if (current.calculatedValue !== null) {
                continue;
            }

            if (current.inputConnections.length === 0) {
                current.calculatedValue = current.dollarAmount;
                idMap.set(current.id, current);
                continue;
            }

            // why am I casting from string to number so often?
            // the properties are defined as numbers ??
            for (let i = connIndex; i < current.inputConnections.length; i++) {
                const parentConn = current.inputConnections[i]!;
                const parent = idMap.get(parentConn.inputFlowId)!;
                const intervalLambda = intervalMat[current.interval]![interval]!;

                if (parent.calculatedValue !== null) {
                    current.calculatedValue = current.calculatedValue === null ? 0 : Number(current.calculatedValue);
                    if (parentConn.percentAmount !== 0) {
                        const base = parent.dollarAmount !== 0 ? parent.dollarAmount : parent.calculatedValue;
                        const value = Number((parentConn.percentAmount / 100) * base);
                        current.calculatedValue += value;
                        parent.calculatedValue -= value;
                    }

                    const connDollarAmount = Number(parentConn.dollarAmount * intervalLambda);
                    if (connDollarAmount !== 0) {
                        current.calculatedValue += connDollarAmount;
                        parent.calculatedValue -= connDollarAmount;
                    }

                    if (current.outputConnections.length > 0 && current.dollarAmount === 0) {
                        current.dollarAmount = current.calculatedValue;
                    }

                    idMap.set(current.id, current);
                    idMap.set(parent.id, parent);
                } else {
                    backlog.push([current.id, i]);
                    backlog.push([parentConn.inputFlowId, 0]);
                    break;
                }
            }
        }

        return idMap;
    };

    useEffect(() => {
        console.log('CHECK');
        const dashboardFlows = props.allFlows.map((flow: any) => {
            return {
                id: flow.id,
                name: flow.name,
                userId: flow.userId,
                interval: flow.interval,
                dollarAmount: flow.dollarAmount,
                percentAmount: flow.percentAmount,
                calculatedValue: null,
                inputConnections: flow.inputConnections.map((conn: any) => conn as DashboardConnection),
                outputConnections: flow.outputConnections.map((conn: any) => conn as DashboardConnection),
            } as DashboardFlow;
        });

        // interval conversion
        for (let i = 0; i < dashboardFlows.length; i++) {
            const flow = dashboardFlows[i]!;
            flow.dollarAmount *= intervalMat[flow.interval]![interval]!;

            dashboardFlows[i] = flow;
        }

        let idMap = new Map<number, DashboardFlow>();
        for (const flow of dashboardFlows) {
            idMap.set(flow.id, flow);
        }

        for (const flow of dashboardFlows) {
            idMap = calculateFlow(idMap, flow.id);
        }

        setIdMap(idMap);

        for (let i = 0; i < dashboardFlows.length; i++) {
            const flow = dashboardFlows[i]!;
            dashboardFlows[i] = idMap.get(flow.id)!;
        }

        setFlows(dashboardFlows);
    }, [props.allFlows, interval]);

    const round = (n: number) => {
        return n.toFixed(2);
    };

    return (
        <>
            <button className={buttonClass} onClick={() => props.setCreatingCallback()}>
                Create new flow
            </button>
            <span className="flex">
                Interval:&nbsp;
                <select>
                    <option onClick={() => setInterval(0)}>Day</option>
                    <option onClick={() => setInterval(1)}>Week</option>
                    <option onClick={() => setInterval(2)}>Month</option>
                    <option onClick={() => setInterval(3)}>Year</option>
                </select>
            </span>
            <table>
                <tr className="border-b-[1px] border-black">
                    <td>Name</td>
                    <td>Base</td>
                    <td>
                        <span className="mr-4">Leftover</span>
                    </td>
                    <td>Sources</td>
                    <td></td>
                    <td></td>
                </tr>
                {calculatedFlows
                    ? calculatedFlows.map((flow) => {
                          return (
                              <tr>
                                  <td>
                                      <span className="mr-4">{flow.name}:</span>
                                  </td>
                                  <td>
                                      <span className="mr-4">
                                          {flow.dollarAmount !== 0
                                              ? round(flow.dollarAmount)
                                              : round(flow.calculatedValue!)}
                                      </span>
                                  </td>
                                  <td>
                                      <span className="mr-4">
                                          {flow.outputConnections.length > 0
                                              ? round(flow.calculatedValue ? flow.calculatedValue : 0)
                                              : round(0)}
                                      </span>
                                  </td>
                                  <td>
                                      <span className="mr-4">
                                          {flow.inputConnections
                                              .map((conn) => {
                                                  return flowIdMap.get(conn.inputFlowId)!.name;
                                              })
                                              .join(', ')}
                                      </span>
                                  </td>
                                  <td>
                                      <button
                                          className="rounded border-2 border-black px-2"
                                          onClick={props.removeFlow(flow.id)}
                                      >
                                          Edit
                                      </button>
                                  </td>
                                  <td>
                                      <button
                                          className="rounded border-2 border-black px-2"
                                          onClick={props.removeFlow(flow.id)}
                                      >
                                          Delete
                                      </button>
                                  </td>
                              </tr>
                          );
                      })
                    : []}
            </table>
        </>
    );
}
