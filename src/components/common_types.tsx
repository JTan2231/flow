export type DashboardConnection = {
    id: number;
    dollarAmount: number;
    percentAmount: number;
    inputFlowId: number;
    outputFlowId: number;
};

export type DashboardFlow = {
    id: number;
    name: string;
    userId: string;
    interval: number;
    dollarAmount: number;
    percentAmount: number;
    calculatedValue: number | null;
    inputConnections: DashboardConnection[];
    outputConnections: DashboardConnection[];
    inputFlows: DashboardFlow[];
    outputFlows: DashboardFlow[];
};
