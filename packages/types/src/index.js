"use strict";
// ============================================================================
// USER TYPES
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealCondition = exports.DealStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
// ============================================================================
// DEAL TYPES
// ============================================================================
var DealStatus;
(function (DealStatus) {
    DealStatus["DRAFT"] = "DRAFT";
    DealStatus["PUBLISHED"] = "PUBLISHED";
    DealStatus["DECLINED"] = "DECLINED";
    DealStatus["EXPIRED"] = "EXPIRED";
    DealStatus["SOLD"] = "SOLD";
    DealStatus["ARCHIVED"] = "ARCHIVED";
})(DealStatus || (exports.DealStatus = DealStatus = {}));
var DealCondition;
(function (DealCondition) {
    DealCondition["NEW"] = "NEW";
    DealCondition["LIKE_NEW"] = "LIKE_NEW";
    DealCondition["GOOD"] = "GOOD";
    DealCondition["FAIR"] = "FAIR";
    DealCondition["POOR"] = "POOR";
})(DealCondition || (exports.DealCondition = DealCondition = {}));
//# sourceMappingURL=index.js.map