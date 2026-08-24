export type HealthContract = Readonly<{
  service: string;
  status: "ok";
  version: string;
}>;

export function createHealthContract(
  service: string,
  version: string,
): HealthContract {
  if (service.trim().length === 0) {
    throw new Error("service must not be empty");
  }

  if (version.trim().length === 0) {
    throw new Error("version must not be empty");
  }

  return {
    service,
    status: "ok",
    version,
  };
}
