declare class DevForgeServer {
    private app;
    private server;
    private io;
    private port;
    constructor();
    private initializeServices;
    private setupMiddleware;
    private setupRoutes;
    private setupSocketIO;
    private setupErrorHandling;
    start(): Promise<void>;
    stop(): Promise<void>;
}
declare const server: DevForgeServer;
export declare const app: any;
export default server;
//# sourceMappingURL=index.d.ts.map