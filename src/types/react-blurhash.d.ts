declare module 'react-blurhash' {
    import * as React from 'react';

    export interface BlurhashProps extends React.HTMLAttributes<HTMLCanvasElement> {
        hash: string;
        width?: number | string;
        height?: number | string;
        gl?: boolean;
        resolutionX?: number;
        resolutionY?: number;
        punch?: number;
    }

    export class Blurhash extends React.PureComponent<BlurhashProps> { }
}
