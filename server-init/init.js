import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

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

function ask(question, hidden = false) {
    return new Promise((resolve) => {
        // mostramos el label ANTES
        process.stdout.write(question);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });

        if (hidden) {
            rl.stdoutMuted = true;

            rl._writeToOutput = function (stringToWrite) {
                if (rl.stdoutMuted) {
                    // solo ocultar lo que escribe el usuario
                    rl.output.write('*');
                } else {
                    rl.output.write(stringToWrite);
                }
            };
        }

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

    /* 5️⃣ Descargar ubuntu.tar.gz */
    await execAsync(`
    cd $PREFIX/var/lib/proot-distro/installed-rootfs || exit 1

    if [ ! -f ubuntu.tar.gz ]; then
      echo "⬇️ Downloading ubuntu.tar.gz..."
      curl -L --progress-bar -O \
      https://github.com/hlfr07/Userland_Dashbpoard/releases/download/v1.0.0/ubuntu.tar.gz
    else
      echo "✅ ubuntu.tar.gz already exists"
    fi
  `);

    /* 6️⃣ Extraer ubuntu */
    await execAsync(`
    cd $PREFIX/var/lib/proot-distro/installed-rootfs || exit 1

    if [ ! -d ubuntu ]; then
      echo "📦 Extracting ubuntu.tar.gz..."
      tar -xzf ubuntu.tar.gz
    else
      echo "✅ ubuntu already extracted"
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

    const pass1 = await ask('🔑 Password ttyd: ', true);
    const pass2 = await ask('🔁 Confirmar password: ', true);

    if (!pass1 || !pass2) {
        throw new Error('❌ El password no puede estar vacío');
    }

    if (pass1 !== pass2) {
        throw new Error('❌ Los passwords no coinciden');
    }

    if (pass1.length < 6) {
        throw new Error('❌ Password muy corto (mínimo 6 caracteres)');
    }

    const pass = pass1;


    /* 9️⃣ Levantar ttyd */
    console.log('\n🖥 Starting ttyd on port 7681...');
    await execAsync(`
    pgrep ttyd || ttyd \
      -p 7681 \
      -c ${user}:${pass} \
      bash
  `);

    console.log('\n🎉 Userland environment READY');
    console.log('🌐 Web terminal: http://localhost:7681');
}
