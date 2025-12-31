import { spawn } from 'child_process';
import os from 'os';
import { EventEmitter } from 'events';

const terminals = new Map();

class SimpleTerminal extends EventEmitter {
  constructor(id, shell, cwd) {
    super();
    this.id = id;
    this.shell = shell;
    this.cwd = cwd;
    this.process = null;
    this.buffer = '';
  }

  spawn() {
    const shellArgs = this.shell === 'bash' ? ['-i'] : [];
    
    this.process = spawn(this.shell, shellArgs, {
      cwd: this.cwd,
      env: process.env,
      shell: false
    });

    this.process.stdout.on('data', (data) => {
      const output = data.toString();
      this.emit('data', output);
    });

    this.process.stderr.on('data', (data) => {
      const output = data.toString();
      this.emit('data', output);
    });

    this.process.on('exit', (code) => {
      this.emit('exit', code);
    });

    this.process.on('error', (error) => {
      this.emit('data', `\r\nError: ${error.message}\r\n`);
    });

    return this;
  }

  write(data) {
    if (this.process && this.process.stdin.writable) {
      this.process.stdin.write(data);
    }
  }

  kill() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  resize(cols, rows) {
    // No-op for child_process, PTY feature not available in proot
  }

  onData(callback) {
    this.on('data', callback);
  }

  onExit(callback) {
    this.on('exit', callback);
  }
}

export function createTerminal(id, cols = 80, rows = 24) {
  if (terminals.has(id)) {
    terminals.get(id).kill();
  }

  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  const cwd = process.env.HOME || process.cwd();

  const term = new SimpleTerminal(id, shell, cwd);
  term.spawn();

  terminals.set(id, term);

  return term;
}

export function getTerminal(id) {
  return terminals.get(id);
}

export function resizeTerminal(id, cols, rows) {
  const term = terminals.get(id);
  if (term) {
    term.resize(cols, rows);
    return true;
  }
  return false;
}

export function writeToTerminal(id, data) {
  const term = terminals.get(id);
  if (term) {
    term.write(data);
    return true;
  }
  return false;
}

export function killTerminal(id) {
  const term = terminals.get(id);
  if (term) {
    term.kill();
    terminals.delete(id);
    return true;
  }
  return false;
}

export function cleanupTerminals() {
  terminals.forEach((term, id) => {
    term.kill();
  });
  terminals.clear();
}
