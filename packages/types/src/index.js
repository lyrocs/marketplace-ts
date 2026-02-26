// ============================================================================
// USER TYPES
// ============================================================================
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (UserRole = {}));
// ============================================================================
// DEAL TYPES
// ============================================================================
export var DealStatus;
(function (DealStatus) {
    DealStatus["DRAFT"] = "DRAFT";
    DealStatus["PENDING"] = "PENDING";
    DealStatus["PUBLISHED"] = "PUBLISHED";
    DealStatus["DECLINED"] = "DECLINED";
    DealStatus["EXPIRED"] = "EXPIRED";
    DealStatus["SOLD"] = "SOLD";
    DealStatus["ARCHIVED"] = "ARCHIVED";
})(DealStatus || (DealStatus = {}));
export var DealCondition;
(function (DealCondition) {
    DealCondition["NEW"] = "NEW";
    DealCondition["LIKE_NEW"] = "LIKE_NEW";
    DealCondition["GOOD"] = "GOOD";
    DealCondition["FAIR"] = "FAIR";
    DealCondition["POOR"] = "POOR";
})(DealCondition || (DealCondition = {}));
//# sourceMappingURL=index.js.map