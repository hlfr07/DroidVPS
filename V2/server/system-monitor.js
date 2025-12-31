import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

// Historial de métricas
const MAX_HISTORY = 20;
const cpuHistory = [];
const memoryHistory = [];
const diskHistory = [];

function addToHistory(array, value) {
  const time = new Date().toLocaleTimeString();
  array.push({ value, time });
  if (array.length > MAX_HISTORY) {
    array.shift();
  }
}

export async function getCPUUsage() {
  try {
    // Usar nproc y calcular porcentaje basado en load average
    const loadavg = os.loadavg();
    const { stdout: nprocOut } = await execAsync('nproc');
    const cores = parseInt(nprocOut.trim());

    // Calcular CPU usage como porcentaje del load promedio
    const cpuUsage = (loadavg[0] / cores) * 100;
    return Math.min(100, Math.max(0, cpuUsage));
  } catch (error) {
    // Fallback a método alternativo
    const loadavg = os.loadavg();
    const cpus = os.cpus().length;
    return Math.min(100, (loadavg[0] / cpus) * 100);
  }
}

export async function getMemoryUsage() {
  try {
    // Usar free -b para obtener valores en bytes
    const { stdout } = await execAsync("free -b | grep Mem | awk '{print $2,$3,$4}'");
    const [total, used, free] = stdout.trim().split(' ').map(Number);

    return {
      total,
      used,
      free,
      usagePercent: (used / total) * 100
    };
  } catch (error) {
    // Fallback a os.totalmem/freemem
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: (usedMem / totalMem) * 100
    };
  }
}

export async function getDiskUsage() {
  try {
    const { stdout } = await execAsync("df -h");
    const lines = stdout.trim().split('\n');
    let diskInfo = null;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      const mountPoint = parts[parts.length - 1];
      const filesystem = parts[0];

      if (
        mountPoint === '/data' ||
        mountPoint === '/storage/emulated' ||
        (diskInfo === null && mountPoint === '/')
      ) {
        diskInfo = {
          filesystem,
          total: parts[1],
          used: parts[2],
          available: parts[3],
          usagePercent: parseInt(parts[4]) || 0
        };
        if (mountPoint === '/data') break;
      }
    }

    return diskInfo || { total: 'N/A', used: 'N/A', available: 'N/A', usagePercent: 0 };
  } catch (error) {
    return { total: 'N/A', used: 'N/A', available: 'N/A', usagePercent: 0 };
  }
}


export async function getSwapUsage() {
  try {
    // Usar free para obtener swap
    const { stdout } = await execAsync("free -b | grep Swap | awk '{print $2,$3,$4}'");
    const [total, used, free] = stdout.trim().split(' ').map(Number);

    if (total === 0) {
      return { total: 0, used: 0, free: 0, usagePercent: 0 };
    }

    return {
      total,
      used,
      free,
      usagePercent: (used / total) * 100
    };
  } catch (error) {
    return { total: 0, used: 0, free: 0, usagePercent: 0 };
  }
}

export async function getSystemLoad() {
  const loadavg = os.loadavg();
  return {
    load1: loadavg[0].toFixed(2),
    load5: loadavg[1].toFixed(2),
    load15: loadavg[2].toFixed(2)
  };
}

export async function getProcessList() {
  try {
    // ps aux funciona en userland
    const { stdout } = await execAsync("ps aux --sort=-%mem | head -20");
    const lines = stdout.trim().split('\n');
    const processes = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 11) {
        processes.push({
          user: parts[0],
          pid: parts[1],
          cpu: parts[2],
          mem: parts[3],
          vsz: parts[4],
          rss: parts[5],
          tty: parts[6],
          stat: parts[7],
          start: parts[8],
          time: parts[9],
          command: parts.slice(10).join(' ')
        });
      }
    }

    return processes;
  } catch (error) {
    return [];
  }
}

export async function getCPUDetails() {
  try {
    // lscpu funciona en userland
    const { stdout } = await execAsync('lscpu');
    const lines = stdout.split('\n');
    const details = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        details[key.trim()] = value;
      }
    });

    return {
      architecture: details['Architecture'] || os.arch(),
      cpuOpModes: details['CPU op-mode(s)'] || 'N/A',
      byteOrder: details['Byte Order'] || (os.endianness() === 'LE' ? 'Little Endian' : 'Big Endian'),
      cpuCount: details['CPU(s)'] || os.cpus().length.toString(),
      onlineCpus: details['On-line CPU(s) list'] || 'N/A',
      vendorId: details['Vendor ID'] || 'N/A',
      modelName: details['Model name'] || os.cpus()[0]?.model || 'N/A',
      threadsPerCore: details['Thread(s) per core'] || 'N/A',
      coresPerSocket: details['Core(s) per socket'] || 'N/A',
      sockets: details['Socket(s)'] || 'N/A',
      cpuMaxMhz: details['CPU max MHz'] || details['CPU MHz'] || os.cpus()[0]?.speed?.toString() || 'N/A',
      cpuMinMhz: details['CPU min MHz'] || 'N/A',
      flags: details['Flags'] || 'N/A'
    };
  } catch (error) {
    const cpus = os.cpus();
    return {
      architecture: os.arch(),
      cpuOpModes: 'N/A',
      byteOrder: os.endianness() === 'LE' ? 'Little Endian' : 'Big Endian',
      cpuCount: cpus.length.toString(),
      onlineCpus: 'N/A',
      vendorId: 'N/A',
      modelName: cpus[0]?.model || 'N/A',
      threadsPerCore: 'N/A',
      coresPerSocket: 'N/A',
      sockets: 'N/A',
      cpuMaxMhz: cpus[0]?.speed?.toString() || 'N/A',
      cpuMinMhz: 'N/A',
      flags: 'N/A'
    };
  }
}

export async function getSystemInfo() {
  try {
    const { stdout: lscpuOut } = await execAsync('lscpu');
    const lines = lscpuOut.trim().split('\n');

    const info = {};

    lines.forEach(line => {
      const [key, ...rest] = line.split(':');
      if (!key || !rest) return;
      const value = rest.join(':').trim();

      switch (key.trim()) {
        case 'Architecture':
          info.arch = value;
          break;
        case 'CPU(s)':
          info.cpus = parseInt(value);
          break;
        case 'On-line CPU(s) list':
          info.online = value;
          break;
        case 'Vendor ID':
          info.vendor = value;
          break;
        case 'Model name':
          if (!info.model) info.model = value; // el primero que aparezca
          break;
        case 'CPU max MHz':
          info.maxMHz = parseFloat(value);
          break;
        case 'CPU min MHz':
          info.minMHz = parseFloat(value);
          break;
        case 'Thread(s) per core':
          info.threadsPerCore = parseInt(value);
          break;
        case 'Core(s) per socket':
          info.coresPerSocket = parseInt(value);
          break;
        case 'Socket(s)':
          info.sockets = parseInt(value);
          break;
      }
    });

    // hostname y kernel
    const { stdout: unameOut } = await execAsync('uname -a');
    const unameParts = unameOut.trim().split(' ');

    info.hostname = unameParts[1] || os.hostname();
    info.kernel = unameParts[2] || 'N/A';
    info.uptime = os.uptime();

    return info;
  } catch (error) {
    // fallback clásico
    return {
      hostname: os.hostname(),
      arch: os.arch(),
      cpus: os.cpus().length,
      kernel: 'N/A',
      uptime: os.uptime()
    };
  }
}


export async function getDistroInfo() {
  try {
    // lsb_release funciona en userland
    const { stdout } = await execAsync('lsb_release -a 2>/dev/null');
    const lines = stdout.split('\n');
    const info = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        info[key.trim()] = valueParts.join(':').trim();
      }
    });

    return {
      distributor: info['Distributor ID'] || 'N/A',
      description: info['Description'] || 'N/A',
      release: info['Release'] || 'N/A',
      codename: info['Codename'] || 'N/A'
    };
  } catch (error) {
    return {
      distributor: 'N/A',
      description: 'N/A',
      release: 'N/A',
      codename: 'N/A'
    };
  }
}

export async function getAllSystemData() {
  const [cpu, memory, disk, swap, load, processes, info, cpuDetails, distro] = await Promise.all([
    getCPUUsage(),
    getMemoryUsage(),
    getDiskUsage(),
    getSwapUsage(),
    getSystemLoad(),
    getProcessList(),
    getSystemInfo(),
    getCPUDetails(),
    getDistroInfo()
  ]);

  // Agregar al historial
  addToHistory(cpuHistory, cpu);
  addToHistory(memoryHistory, memory.usagePercent);
  addToHistory(diskHistory, disk.usagePercent);

  return {
    cpu,
    cpuHistory: [...cpuHistory],
    memory,
    memoryHistory: [...memoryHistory],
    disk,
    diskHistory: [...diskHistory],
    swap,
    load,
    processes,
    info,
    cpuDetails,
    distro,
    timestamp: Date.now()
  };
}

