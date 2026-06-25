"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePrice = void 0;
const normalizePrice = (value) => {
    const normalized = value
        .replace(/\s+/g, '')
        .replace(/,/g, '.')
        .replace(/[^\d.]/g, '');
    if (!normalized) {
        return null;
    }
    const numericValue = Number.parseFloat(normalized);
    if (Number.isNaN(numericValue)) {
        return null;
    }
    return numericValue.toFixed(2);
};
exports.normalizePrice = normalizePrice;
//# sourceMappingURL=price.util.js.map