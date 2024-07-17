import { Company } from "../Entity/CompanyEntity";
import { Person } from "../Entity/PersonEntity";
import { Task } from "../Entity/TaskEntity";
import { recordType } from "./ApiTypes";

export type rabbitPayload = {
    id: any;
    type: "insert" | "update";
    recordType: recordType;
    flowId: any;
    orgId: any;
    isWaitRecord? :boolean,
    componentId? :string
}

export type NodeData = {
    uId: string;
    compId: number;
    label: string;
    description: string;
    compConfig: string;
}

export type Node = {
    id: string;
    data: NodeData;
    position: { x: number; y: number };
    positionAbsolute: { x: number; y: number };
    style: { [key: string]: any };
    width: number;
    height: number;
};

export type Edge = {
    source: string;
    target: string;
    id: string;
};


export type RObject = Company | Task | Person;

export type emailNodePayload = {
    recordId : string,
    subject :string,
    body:string,
    email : string
}