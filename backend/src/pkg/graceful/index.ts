type Process = {
  name: string;
  shutdownFunction: () => Promise<void> | void;
};

const processes: Process[] = [];

export function registerProcessForShutdown(name: string, shutdownFunction: () => Promise<void> | void) {
  processes.push({ name, shutdownFunction });
  console.log(`Registered process "${name}" for graceful shutdown`);
}

export async function shutdownProcesses() {
  console.log("Shutting down processes...");
  for (const proc of processes) {
    console.log(`Shutting down: ${proc.name}`);
    await proc.shutdownFunction();
    console.log(`Shut down: ${proc.name}`);
  }
  console.log("All processes shut down.");
}
