import { EventEmitter } from '@stencil/core';
export declare class MyName {
    first: string;
    last: string;
    config: any;
    date: Date;
    onMyClick: EventEmitter;
    handleClick(e: any): void;
    render(): JSX.Element;
}

