
export function wrapString(text: string, length: number = 72): string {
    let result = "";
    for (let i = 0; i < text.length; i += length) {
        result += text.slice(i, i + length);
        result += "\n";
    }
    return result;
}
function base64urlDecode(s: string): string {
    const step1 = s.replace(/-/g, "+"); // 62nd char of encoding
    const step2 = step1.replace(/_/g, "/"); // 63rd char of encoding
    let step3 = step2;
    switch (step2.length % 4) { // Pad with trailing '='s
        case 0: // No pad chars in this case
            break;
        case 2: // Two pad chars
            step3 += "==";
            break;
        case 3: // One pad char
            step3 += "=";
            break;
        default:
            throw new Error("Illegal base64url string!");
    }
    return window.atob(step3); // Regular base64 decoder
}

function stringToArray(s: string): number[] {
    return s.split("").map(c => c.charCodeAt(0));
}


function arrayToPem(a: readonly number[]): string {
    return window.btoa(a.map(c => String.fromCharCode(c)).join(""));
}


function integerToOctet(n: number): number[] {
    const result = [];
    for (let i = n; i > 0; i >>= 8) {
        result.push(i & 0xff);
    }
    return result.reverse();
}

function lenToArray(n: number): number[] {
    const oct = integerToOctet(n);
    let i;
    for (i = oct.length; i < 4; i += 1) {
        oct.unshift(0);
    }
    return oct;
}


function checkHighestBit(v: readonly number[]) {
    if (v[0] >> 7 === 1) {
        // add leading zero if first bit is set
        return [0, ...v];
    }
    return v;
}

function jwkToInternal(jwk: Readonly<JsonWebKey>) {
    return {
        type: "ssh-rsa",
        exponent: checkHighestBit(stringToArray(base64urlDecode(jwk.e!))),
        name: "name",
        key: checkHighestBit(stringToArray(base64urlDecode(jwk.n!))),
    };
}

export function encodePublicKey(jwk: Readonly<JsonWebKey>, name: string): string {
    const k = jwkToInternal(jwk);
    k.name = name;
    const keyLenA = lenToArray(k.key.length);
    const exponentLenA = lenToArray(k.exponent.length);
    const typeLenA = lenToArray(k.type.length);
    const array = [
        ...typeLenA, ...stringToArray(k.type), ...exponentLenA, ...k.exponent, ...keyLenA, ...k.key,
    ];
    const encoding = arrayToPem(array);
    return `${k.type} ${encoding} ${k.name}`;
}

function asnEncodeLen(n: number): number[] {
    let result = [];
    if (n >> 7) {
        result = integerToOctet(n);
        result.unshift(0x80 + result.length);
    } else {
        result.push(n);
    }
    return result;
}

export function encodePrivateKey(jwk: Readonly<JsonWebKey>): string {
    const order = ["n", "e", "d", "p", "q", "dp", "dq", "qi"] as const;
    const list = order.map(prop => {
        const v = checkHighestBit(stringToArray(base64urlDecode(jwk[prop]!)));
        const len = asnEncodeLen(v.length);
        return [0x02].concat(len, v); // int tag is 0x02
    });
    let seq = [0x02, 0x01, 0x00]; // extra seq for SSH
    seq = seq.concat(...list);
    const len = asnEncodeLen(seq.length);
    const a = [0x30].concat(len, seq); // seq is 0x30
    return arrayToPem(a);
}