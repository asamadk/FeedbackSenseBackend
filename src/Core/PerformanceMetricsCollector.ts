import { exec } from 'child_process';
import os from 'os';
import { promisify } from 'util';

export type Metric = {
    name: string;
    value: string | number;
};

class PerformanceMetricsCollector {

    static execAsync = promisify(exec);

    private static formatMemoryUsage(memoryBytes: number): string {
        return (memoryBytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    private static async getCPUUsage(): Promise<number | string> {
        try {
            return new Promise(resolve => {
                const start = process.cpuUsage();
                setTimeout(() => {
                    const end = process.cpuUsage(start);
                    const percentageCPU = (100 * (end.user + end.system) / (os.cpus().length * 1000)).toFixed(2);
                    resolve(Number(percentageCPU));
                }, 1000);
            });
        } catch (error) {
            return 'Error getting CPU usage';
        }
    }

    public static async collectMetrics(): Promise<Metric[]> {
        const cpuUsage = await this.getCPUUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = (usedMemory / totalMemory) * 100;

        const diskUsage = await this.getDiskUsage();
        const networkLatency = await this.getNetworkLatency();

        return [
            { name: 'CPU Usage', value: `${cpuUsage}%` },
            { name: 'Memory Usage', value: `${memoryUsage.toFixed(2)}%` },
            { name: 'Total Memory', value: this.formatMemoryUsage(totalMemory) },
            { name: 'Free Memory', value: this.formatMemoryUsage(freeMemory) },
            // { name: 'Disk Usage', value: typeof diskUsage === 'number' ? `${diskUsage} GB` : diskUsage},
            { name: 'Network Latency', value: networkLatency },
            { name: 'System Uptime', value: `${os.uptime()} seconds` }
        ];
    }

    private static async getDiskUsage(): Promise<number | string> {
        try {
            // This command works on Unix-based systems.
            const { stdout } = await this.execAsync(`df -k | awk '{print $4}' | tail -n +2`);
            const lines = stdout.trim().split('\n').slice(1);

            const totalAvailableKB = lines.reduce((acc, line) => {
                const availableKB = parseInt(line, 10);
                return acc + (isNaN(availableKB) ? 0 : availableKB);
            }, 0);

            const totalAvailableGB = totalAvailableKB / (1024 * 1024);
            return totalAvailableGB;
        } catch (error) {
            console.error('Error getting disk usage:', error);
            return 'Error getting disk usage';
        }
    }

    private static async getNetworkLatency(): Promise<string> {
        try {
            // This command pings Google's DNS server to check network latency
            const { stdout } = await this.execAsync('ping -c 4 8.8.8.8'); // '-c 4' means 4 packets
            return stdout;
        } catch (error) {
            console.error('Error getting network latency:', error);
            return 'Error getting network latency';
        }
    }
}

export default PerformanceMetricsCollector;