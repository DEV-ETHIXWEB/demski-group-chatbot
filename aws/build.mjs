// Regenerates the two Lambda deployment packages (lambda-chat/, lambda-send-lead/)
// from the canonical source (../api, ../knowledge, ../email-templates) and
// zips each into an upload-ready .zip. Run this after any change to
// api/chat.js, api/send-lead.js, api/_lib/knowledge.js, knowledge/**, or
// email-templates/** — those are copied here, not symlinked, so the zips
// go stale otherwise.
//
// Usage: node aws/build.mjs
import { cpSync, rmSync, mkdirSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function resetDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function buildChat() {
  const out = join(__dirname, 'lambda-chat');
  resetDir(join(out, 'api', '_lib'));
  resetDir(join(out, 'knowledge'));
  cpSync(join(ROOT, 'api', 'chat.js'), join(out, 'api', 'chat.js'));
  cpSync(join(ROOT, 'api', '_lib', 'knowledge.js'), join(out, 'api', '_lib', 'knowledge.js'));
  cpSync(join(ROOT, 'knowledge'), join(out, 'knowledge'), { recursive: true });
  console.log('[build] lambda-chat source synced');
}

function buildSendLead() {
  const out = join(__dirname, 'lambda-send-lead');
  resetDir(join(out, 'api'));
  resetDir(join(out, 'email-templates'));
  cpSync(join(ROOT, 'api', 'send-lead.js'), join(out, 'api', 'send-lead.js'));
  cpSync(join(ROOT, 'email-templates', 'chatbot-lead-notification.html'), join(out, 'email-templates', 'chatbot-lead-notification.html'));
  cpSync(join(ROOT, 'email-templates', 'chatbot-lead-confirmation.html'), join(out, 'email-templates', 'chatbot-lead-confirmation.html'));
  console.log('[build] lambda-send-lead source synced');
  execFileSync('npm', ['install', '--omit=dev'], { cwd: out, stdio: 'inherit', shell: true });
}

function zip(name) {
  const dir = join(__dirname, name);
  const zipPath = join(__dirname, name + '.zip');
  if (existsSync(zipPath)) rmSync(zipPath);
  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-Command', `Compress-Archive -Path "${dir}\\*" -DestinationPath "${zipPath}"`],
    { stdio: 'inherit' }
  );
  console.log('[build] wrote', zipPath);
}

buildChat();
buildSendLead();
zip('lambda-chat');
zip('lambda-send-lead');
console.log('[build] done — upload aws/lambda-chat.zip and aws/lambda-send-lead.zip to their Lambda functions');
