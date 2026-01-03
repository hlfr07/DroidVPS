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

  // 0️⃣ Termux check
  try {
    await execAsync('command -v pkg');
  } catch {
    throw new Error('❌ This must be run inside Termux');
  }

  // 1️⃣ Dependencias base
  await ensureCommand('curl', 'pkg install -y curl');
  await ensureCommand('tar', 'pkg install -y tar');
  await ensureCommand('proot-distro', 'pkg install -y proot-distro');

  // 2️⃣ ¿Existe installed-rootfs?
  let hasRootfs = true;
  try {
    await execAsync('ls $PREFIX/var/lib/proot-distro/installed-rootfs');
  } catch {
    hasRootfs = false;
  }

  // 3️⃣ Si NO existe → instalar alpine
  if (!hasRootfs) {
    console.log('📦 No distro found. Installing base alpine...');
    await execAsync('proot-distro install alpine');
  } else {
    console.log('✅ installed-rootfs exists');
  }

  // 4️⃣ Descargar ubuntu.tar.gz
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

  // 5️⃣ Extraer ubuntu
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
