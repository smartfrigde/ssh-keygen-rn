import { genKeyPairProps } from "../SshKeygenRn.types";
import { encodePrivateKey, encodePublicKey, wrapString } from "./util";

const extractable = true;

function rsaPrivateKey(key: string): string {
    return `-----BEGIN RSA PRIVATE KEY-----\n${key}-----END RSA PRIVATE KEY-----`;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
export async function generateKeyPair(
    { alg, size, name, hash, encryption }:
        genKeyPairProps): Promise<{ privateKey: string, publicKey: string }> {
    const key = await window.crypto.subtle
        .generateKey(
            {
                name: alg ? alg : "RSASSA-PKCS1-v1_5",
                modulusLength: size,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: hash },
            },
            extractable,
            ["sign", "verify"]
        );
 
    if (encryption === "pkcs8") {
        const pkcs8 = await window.crypto.subtle.exportKey("pkcs8", key.privateKey);
        const pkcs8Array = new Uint8Array(pkcs8);
        const pkcs8Base64 = arrayBufferToBase64(pkcs8Array.buffer);
        const pkcs8String = wrapString(pkcs8Base64);
        const pkcs8PrivateKey = `-----BEGIN PRIVATE KEY-----\n${pkcs8String}-----END PRIVATE KEY-----`;
        const pkcs8PublicKey = await window.crypto.subtle.exportKey("spki", key.publicKey);
        const pkcs8PublicKeyArray = new Uint8Array(pkcs8PublicKey);
        const pkcs8PublicKeyBase64 = arrayBufferToBase64(pkcs8PublicKeyArray.buffer);
        const pkcs8PublicKeyString = wrapString(pkcs8PublicKeyBase64);
        const pkcs8PublicKeyPem = `-----BEGIN PUBLIC KEY-----\n${pkcs8PublicKeyString}-----END PUBLIC KEY-----`;
        return {
            privateKey: pkcs8PrivateKey,
            publicKey: pkcs8PublicKeyPem
        };
    } else if (encryption === "jwk") {
        const privateKeyPromise = window.crypto.subtle
            .exportKey("jwk", key.privateKey)
            .then(encodePrivateKey)
            .then(wrapString)
            .then(rsaPrivateKey);

        const publicKeyPromise = window.crypto.subtle.exportKey("jwk", key.publicKey).then(jwk => encodePublicKey(jwk, name));
        const [privateKey, publicKey] = await Promise.all([privateKeyPromise, publicKeyPromise] as const);
        return {
            privateKey,
            publicKey
        };
    }
    return {
        privateKey: "",
        publicKey: ""
    };
}