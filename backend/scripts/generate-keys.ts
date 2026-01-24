import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const secretsDir = path.join(__dirname, '../secrets');

if (!fs.existsSync(secretsDir)) {
    fs.mkdirSync(secretsDir);
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

fs.writeFileSync(path.join(secretsDir, 'private.key'), privateKey);
fs.writeFileSync(path.join(secretsDir, 'public.key'), publicKey);

console.log('Keys generated successfully in secrets/');
