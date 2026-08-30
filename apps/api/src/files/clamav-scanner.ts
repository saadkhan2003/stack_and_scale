import { Socket } from "node:net";
import type {
  MalwareScanHook,
  MalwareScanStatus,
} from "./private-files.service.js";

export type ClamAvScannerOptions = Readonly<{
  host: string;
  port: number;
  timeoutMs: number;
}>;

/** ClamAV's INSTREAM protocol keeps uploads inside the Docker network. */
export class ClamAvScanner implements MalwareScanHook {
  public constructor(private readonly options: ClamAvScannerOptions) {
    if (!options.host.trim()) throw new Error("ClamAV host must not be empty");
    if (
      !Number.isSafeInteger(options.port) ||
      options.port < 1 ||
      options.port > 65535
    )
      throw new Error("ClamAV port must be valid");
  }

  public async scan(input: { body: Uint8Array }): Promise<MalwareScanStatus> {
    return new Promise((resolve, reject) => {
      const socket = new Socket();
      let response = "";
      const fail = (error: Error) => {
        socket.destroy();
        reject(error);
      };
      socket.setTimeout(this.options.timeoutMs, () =>
        fail(new Error("ClamAV scan timed out")),
      );
      socket.once("error", fail);
      socket.on("data", (chunk: Buffer) => {
        response += chunk.toString("utf8");
      });
      socket.once("close", () => {
        if (/\bFOUND\b/.test(response)) resolve("quarantined");
        else if (/\bOK\b/.test(response)) resolve("clean");
        else
          reject(
            new Error(
              `ClamAV scan failed: ${response.trim() || "no response"}`,
            ),
          );
      });
      socket.connect(this.options.port, this.options.host, () => {
        socket.write("zINSTREAM\0");
        const length = Buffer.alloc(4);
        length.writeUInt32BE(input.body.byteLength);
        socket.write(length);
        socket.write(input.body);
        socket.end(Buffer.alloc(4));
      });
    });
  }
}

export function createMalwareScanner(
  environment: NodeJS.ProcessEnv = process.env,
): MalwareScanHook {
  if (environment["MALWARE_SCAN_PROVIDER"] !== "clamav")
    return { scan: () => Promise.resolve("pending" as const) };
  return new ClamAvScanner({
    host: environment["CLAMAV_HOST"]?.trim() || "clamav",
    port: Number(environment["CLAMAV_PORT"] ?? 3310),
    timeoutMs: Number(environment["CLAMAV_TIMEOUT_MS"] ?? 30_000),
  });
}
