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

export {isEqualSet};