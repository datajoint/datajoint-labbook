function isEqualSet(a: Set<any>, b: Set<any>): boolean {
    if (a.size !== b.size) {
        return false;
    }
    
    // Check each elements
    for (let element of a) {
        if (!b.has(element)) {
            return false;
        }
    }
    return true;
}

function reviver(key: any, value: string ) {
    if ( value === '***NaN***' ) {
        return NaN;
    }
    if ( value === '***Infinity***' ) {
        return Infinity;
    }
    if ( value === '***-Infinity***' ) {
        return -Infinity;
    }
    return value;
}

export {isEqualSet, reviver};