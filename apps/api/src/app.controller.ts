import { Controller, Get } from "@nestjs/common";
import {
  createHealthContract,
  type HealthContract,
} from "@stack-and-scale/contracts";

@Controller()
export class AppController {
  @Get("health")
  health(): HealthContract {
    return createHealthContract("api", "0.0.0");
  }

  @Get("version")
  version(): Pick<HealthContract, "service" | "version"> {
    const health = this.health();

    return {
      service: health.service,
      version: health.version,
    };
  }

  @Get("ready")
  readiness(): {
    service: string;
    status: "ready";
    version: string;
    checks: { application: "up" };
  } {
    const health = this.health();

    return {
      service: health.service,
      status: "ready",
      version: health.version,
      checks: {
        application: "up",
      },
    };
  }
}
