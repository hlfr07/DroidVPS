import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function ensureCommand(cmd, installCmd) {
  try {
    await execAsync(`command -v ${cmd}`);
    console.log(`✅ ${cmd} already installed`);
  } catch {
    console.log(`📦 Installing ${cmd}...`);
    await execAsync(installCmd);
  }
}

export async function initServer() {
  console.log('🚀 Bootstrapping Userland environment...\n');

  // 0️⃣ Verificar pkg (Termux)
  try {
    await execAsync('command -v pkg');
  } catch {
    throw new Error('❌ This installer must be run inside Termux');
  }

  // 1️⃣ curl
  await ensureCommand('curl', 'pkg install -y curl');

  // 2️⃣ tar
  await ensureCommand('tar', 'pkg install -y tar');

  // 3️⃣ proot-distro
  await ensureCommand('proot-distro', 'pkg install -y proot-distro');

  // 4️⃣ alpine distro
  const { stdout } = await execAsync('proot-distro list');
  if (!stdout.includes('alpine')) {
    console.log('📦 Installing alpine distro...');
    await execAsync('proot-distro install alpine');
  } else {
    console.log('✅ Alpine already installed');
  }

  // 5️⃣ Descargar ubuntu.tar.gz
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

  // 6️⃣ Extraer
  await execAsync(`
    cd $PREFIX/var/lib/proot-distro/installed-rootfs || exit 1

    if [ ! -d ubuntu ]; then
      echo "📦 Extracting ubuntu.tar.gz..."
      tar -xzf ubuntu.tar.gz
    else
      echo "✅ ubuntu already extracted"
    fi
  `);

  console.log('\n🎉 Userland environment READY');
}
