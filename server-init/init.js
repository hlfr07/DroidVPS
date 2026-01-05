import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import os from 'os';

const execAsync = promisify(exec);

/* =========================
   Helpers
========================= */

async function ensureCommand(cmd, installCmd) {
    try {
        await execAsync(`command -v ${cmd}`);
        console.log(`✅ ${cmd} already installed`);
    } catch {
        console.log(`📦 Installing ${cmd}...`);
        await execAsync(installCmd);
    }
}

function ask(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function askHidden() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });

        rl.stdoutMuted = true;
        rl._writeToOutput = function (stringToWrite) {
            if (rl.stdoutMuted) {
                rl.output.write('*');
            } else {
                rl.output.write(stringToWrite);
            }
        };

        rl.question('', (answer) => {
            rl.close();
            console.log(); // salto de línea
            resolve(answer.trim());
        });
    });
}


/* =========================
   INIT
========================= */

export async function initServer() {
    console.log('🚀 Bootstrapping Userland environment...\n');

    /* 0️⃣ Verificar Termux */
    try {
        await execAsync('command -v pkg');
    } catch {
        throw new Error('❌ This installer must be run inside Termux');
    }

    /* 1️⃣ Dependencias base */
    await ensureCommand('curl', 'pkg install -y curl');
    await ensureCommand('tar', 'pkg install -y tar');
    await ensureCommand('proot-distro', 'pkg install -y proot-distro');
    await ensureCommand('ttyd', 'pkg install -y ttyd');

    /* 2️⃣ termux-api */
    await ensureCommand(
        'termux-battery-status',
        'pkg install -y termux-api'
    );

    /* 3️⃣ Verificar rootfs */
    let hasRootfs = true;
    try {
        await execAsync('ls $PREFIX/var/lib/proot-distro/installed-rootfs');
    } catch {
        hasRootfs = false;
    }

    /* 4️⃣ Instalar alpine si no hay nada */
    if (!hasRootfs) {
        console.log('📦 No distro found. Installing base alpine...');
        await execAsync('proot-distro install alpine');
    } else {
        console.log('✅ installed-rootfs exists');
    }

    /* 5️⃣ Descargar debian.tar.gz */
    await execAsync(`
    cd $PREFIX/var/lib/proot-distro/installed-rootfs || exit 1

    if [ ! -f debian.tar.gz ]; then
      echo "⬇️ Downloading debian.tar.gz..."
      curl -L --progress-bar -O \
      https://github.com/hlfr07/DroidVPS/releases/download/v1.0.1/debian.tar.gz
    else
      echo "✅ debian.tar.gz already exists"
    fi
  `);

    /* 6️⃣ Extraer debian */
    await execAsync(`
    cd $PREFIX/var/lib/proot-distro/installed-rootfs || exit 1

    if [ ! -d debian ]; then
      echo "📦 Extracting debian.tar.gz..."
      tar -xzf debian.tar.gz
    else
      echo "✅ debian already extracted"
    fi
  `);

    /* 7️⃣ Verificar termux-api app */
    try {
        await execAsync('termux-battery-status');
        console.log('🔋 termux-battery-status working');
    } catch {
        console.log('⚠️ termux-api installed, but Termux:API app may be missing');
    }

    /* 8️⃣ Credenciales ttyd */
    /* 8️⃣ Credenciales ttyd */
    console.log('\n🔐 Web Terminal protection');

    const user = await ask('👤 Usuario ttyd: ');

    if (!user) {
        throw new Error('❌ El usuario no puede estar vacío');
    }

    console.log('\n🔑 Por favor ingrese su password');
    const pass1 = await askHidden();

    console.log('🔁 Confirme su password');
    const pass2 = await askHidden();

    if (!pass1 || !pass2) {
        throw new Error('❌ El password no puede estar vacío');
    }

    if (pass1 !== pass2) {
        throw new Error('❌ Los passwords no coinciden');
    }

    // if (pass1.length < 6) {
    //     throw new Error('❌ Password muy corto (mínimo 6 caracteres)');
    // }

    const pass = pass1;

    //Antes de todo haremos por seacaso un kill de ttyd
    await execAsync('pkill ttyd || echo "ttyd no estaba corriendo"');

    /* 9️⃣ Levantar ttyd */
    console.log('\n🖥 Starting ttyd on port 7681...');
    // spawn('ttyd', [
    //     '-W',
    //     '-p', '7681',
    //     '-c', `${user}:${pass}`,
    //     'bash', '-l'
    // ], {
    //     cwd: process.env.HOME,   // 👈 se va directo al HOME
    //     detached: true,
    //     stdio: 'ignore'
    // }).unref();

    spawn('ttyd', [
        '--writable',
        '-p', '7681',
        '-i', '127.0.0.1',
        'bash', '-l'
    ], {
        cwd: process.env.HOME,   // 👈 se va directo al HOME
        detached: true,
        stdio: 'ignore'
    }).unref();

    // ttyd --writable -p 7681 -i 127.0.0.1 bash

    console.log('\n🎉 Userland environment READY');
    console.log('🌐 Web terminal: http://localhost:7681');

    //Despues de iniciar todo creamos 2 sesiones screen 
    //Primero verificamos si screen esta instalado
    await ensureCommand('screen', 'pkg install -y screen');

    //Para seguridad ejecutamos esto pkill -9 screen y luego esto rm -rf ~/.screen/*
    console.log('\n🧹 Limpiando sesiones screen antiguas');
    await execAsync('pkill -9 screen || echo "screen no estaba corriendo"');
    await execAsync('rm -rf ~/.screen/*');
    console.log('✅ Sesiones screen antiguas limpiadas');

    //Luego creamos las sesiones screen para el panel
    //screen -x node-backend-3001 || screen -S node-backend-3001 proot-distro login node-backend-3001
    //screen -x node-fronted-5173 || screen -S node-fronted-5173 proot-distro login node-fronted-5173
    console.log('💡 Creando sesiones screen para el panel');
    await execAsync(`
    cd ~/DroidVPS/panel/server/ && npm ci && screen -x node-backend-3001 || screen -dmS node-backend-3001 npm run start
    `);
    await execAsync(`
    cd ~/DroidVPS/panel/ && npm ci && screen -x node-frontend-5173 || screen -dmS node-frontend-5173 npx vite --host 0.0.0.0
    `);

    const localIP = getLocalIP();

    console.log('✅ Sesiones screen creadas');
    //Obtenemos el ip local
    console.log(`\n🚀 ¡Todo listo! Accede al panel en http://${localIP}:5173`);
}

function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}
