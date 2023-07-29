export type Flow = {
    id: number;
    name: string;
    userId: string;
    interval: number;
    dollarAmount: number;
    percentAmount: number;
    inputFlows: Connection[];
    outputFlows: Connection[];
};

export type Connection = {
    id: number;
    inputFlowId: number;
    outputFlowId: number;
    inputFlow: Flow;
    outputFlow: Flow;
    dollarAmount: number;
    percentAmount: number;
};

export function newConnection() {
    return {} as Connection;
}
