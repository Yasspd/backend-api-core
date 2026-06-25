"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOptionalPackage = void 0;
const loadOptionalPackage = (packageName) => {
    try {
        return require(packageName);
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Missing runtime dependency "${packageName}": ${reason}`);
    }
};
exports.loadOptionalPackage = loadOptionalPackage;
//# sourceMappingURL=optional-package.util.js.map