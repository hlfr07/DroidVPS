import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import os from 'os';

const execAsync = promisify(exec);

/* =========================
   Helpers
========================= */

// Spinner para mostrar actividad durante operaciones largas
function createSpinner(text) {
    const frames = ['◜ ', '◠ ', '◝ ', '◞ ', '◡ ', '◟ '];
    let index = 0;
    let isActive = true;

    const interval = setInterval(() => {
        if (isActive) {
            process.stdout.write(`\r${text} ${frames[index]}`);
            index = (index + 1) % frames.length;
        }
    }, 120);

    return {
        stop: () => {
            isActive = false;
            clearInterval(interval);
            process.stdout.write(`\r${text} ✓\n`);
        }
    };
}

async function ensureCommand(cmd, installCmd) {
    try {
        await execAsync(`command -v ${cmd}`);
        console.log(`✅ ${cmd} already installed`);
    } catch {
        const spinner = createSpinner(`📦 Installing ${cmd}...`);
        await execAsync(installCmd);
        spinner.stop();
    }
}

// Preguntar en consola TERMINAL INTERACTIVE
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

// Preguntar en consola con input oculto (password)
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
    console.log('🚀 Bootstrapping DroidVPS environment...\n');

    /* 0️⃣ Verificar Termux */
    const spinnerTermux = createSpinner('🔍 Checking Termux...');
    try {
        await execAsync('command -v pkg');
        spinnerTermux.stop('✅ Termux detected');
    } catch {
        spinnerTermux.stop();
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
    const spinnerRootfs = createSpinner('🔍 Checking rootfs...');
    try {
        await execAsync('ls $PREFIX/var/lib/proot-distro/installed-rootfs');
        spinnerRootfs.stop('✅ rootfs found');
    } catch {
        spinnerRootfs.stop();
        hasRootfs = false;
    }

    /* 4️⃣ Instalar alpine si no hay nada */
    if (!hasRootfs) {
        const spinnerAlpine = createSpinner('📦 Installing base alpine...');
        await execAsync('proot-distro install alpine');
        spinnerAlpine.stop();
    } else {
        console.log('✅ installed-rootfs exists');
    }

    /* 5️⃣ Descargar debian.tar.gz */
    const spinnerDownload = createSpinner('⬇️ Downloading debian.tar.gz...');
    await execAsync(`
    cd $PREFIX/var/lib/proot-distro/installed-rootfs || exit 1

    if [ ! -f debian.tar.gz ]; then
      curl -L --silent -O \
      https://github.com/hlfr07/DroidVPS/releases/download/v1.0.1/debian.tar.gz
    else
      echo "✅ debian.tar.gz already exists"
    fi
  `);
    spinnerDownload.stop();

    /* 6️⃣ Extraer debian */
    const spinnerExtract = createSpinner('📦 Extracting debian.tar.gz...');
    await execAsync(`
    cd $PREFIX/var/lib/proot-distro/installed-rootfs || exit 1

    if [ ! -d debian ]; then
      tar -xzf debian.tar.gz
    else
      echo "✅ debian already extracted"
    fi
  `);
    spinnerExtract.stop();

    /* 7️⃣ Verificar termux-api app */
    const spinnerAPI = createSpinner('🔋 Testing termux-battery-status...');
    try {
        await execAsync('termux-battery-status');
        spinnerAPI.stop('🔋 termux-battery-status working');
    } catch {
        spinnerAPI.stop();
        console.log('⚠️ termux-api installed, but Termux:API app may be missing');
    }

    /* 8️⃣ Credenciales */
    console.log('\n🔐 Web Terminal protection');

    const user = await ask('👤 Usuario ttyd: ');

    if (!user) {
        throw new Error('❌ El usuario no puede estar vacío');
    }

    console.log('\n🔑 Por favor ingrese su password. Se recomienda mínimo 6 caracteres incluyendo mayúsculas, minúsculas, números y símbolos');
    const pass1 = await askHidden();

    console.log('🔁 Confirme su password');
    const pass2 = await askHidden();

    if (!pass1 || !pass2) {
        throw new Error('❌ El password no puede estar vacío');
    }

    if (pass1 !== pass2) {
        throw new Error('❌ Los passwords no coinciden');
    }

    const pass = pass1;

    //Vamos a cifrar usuario y password y gyardaremos en un archivo .mycredentials
    const spinnerCred = createSpinner('🔐 Saving credentials...');
    const credentials = Buffer.from(`${user}:${pass}`).toString('base64');
    await execAsync(`echo ${credentials} > ~/.mycredentials`);
    spinnerCred.stop('✅ Credenciales guardadas');

    //Antes de todo haremos por seacaso un kill de ttyd
    const spinnerKillTtyd = createSpinner('🛑 Stopping previous ttyd...');
    await execAsync('pkill ttyd || echo "ttyd no estaba corriendo"');
    spinnerKillTtyd.stop('✅ ttyd stopped');

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

    console.log('\n🎉 DroidVPS environment READY');
    console.log('🌐 Web terminal: http://localhost:7681');

    //Despues de iniciar todo creamos 2 sesiones screen 
    //Primero verificamos si screen esta instalado
    await ensureCommand('screen', 'pkg install -y screen');

    //Para seguridad ejecutamos esto pkill -9 screen y luego esto rm -rf ~/.screen/*
    console.log('\n🧹 Limpiando sesiones screen antiguas');
    const spinnerKillScreen = createSpinner('🛑 Stopping screen sessions...');
    await execAsync('pkill -9 screen || echo "screen no estaba corriendo"');
    spinnerKillScreen.stop();

    const spinnerCleanScreen = createSpinner('🧹 Cleaning screen files...');
    await execAsync('rm -rf ~/.screen/*');
    spinnerCleanScreen.stop('✅ Sesiones screen antiguas limpiadas');

    //Luego creamos las sesiones screen para el panel
    //screen -x node-backend-3001 || screen -S node-backend-3001 proot-distro login node-backend-3001
    //screen -x node-frontend-4200 || screen -S node-frontend-4200 proot-distro login node-frontend-4200
    console.log('💡 Creando sesiones screen para el panel');

    const spinnerBackend = createSpinner('⚙️ Starting backend server...');
    await execAsync(`
    cd ~/DroidVPS/server/ && npm ci && screen -x node-backend-3001 || screen -dmS node-backend-3001 npm run start
    `);
    spinnerBackend.stop('✅ Backend started');

    const spinnerFrontend = createSpinner('🎨 Building frontend...');
    await execAsync(`
    cd ~/DroidVPS/panel/ && npm ci && npm run build && \
screen -x node-frontend-4200 || \
screen -dmS node-frontend-4200 bash -c "echo y | npx serve dist/panel2/browser -l 4200"
    `);
    spinnerFrontend.stop('✅ Frontend started');

    const localIP = getLocalIP();
    
    // Barra de progreso de 10 segundos para asegurar que todo esté levantado
    console.log('\n⏳ Esperando a que todos los servicios estén listos...\n');
    
    let progress = 0;
    const startTime = Date.now();
    const duration = 10000; // 10 segundos
    
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        progress = Math.min((elapsed / duration) * 100, 100);
        
        const filledBars = Math.floor(progress / 5);
        const emptyBars = 20 - filledBars;
        const progressBar = '[' + '█'.repeat(filledBars) + '░'.repeat(emptyBars) + ']';
        process.stdout.write(`\r${progressBar} ${Math.floor(progress)}%`);
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            process.stdout.write('\n✓ Todos los servicios están listos!\n');
        }
    }, 100);
    
    // Esperar los 10 segundos
    await new Promise(resolve => setTimeout(resolve, duration));
    
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
