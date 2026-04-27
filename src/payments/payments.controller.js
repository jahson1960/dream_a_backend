"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
var common_1 = require("@nestjs/common");
var PaymentsController = function () {
    var _classDecorators = [(0, common_1.Controller)('payments')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _validateUser_decorators;
    var _validateUserGet_decorators;
    var _performTransaction_decorators;
    var _verify_decorators;
    var _verifyQuery_decorators;
    var PaymentsController = _classThis = /** @class */ (function () {
        function PaymentsController_1(paymentsService) {
            this.paymentsService = (__runInitializers(this, _instanceExtraInitializers), paymentsService);
        }
        PaymentsController_1.prototype.validateUser = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.paymentsService.validateAndCreateReference(dto)];
                });
            });
        };
        PaymentsController_1.prototype.validateUserGet = function (username, account_number, email, amount, currency_code, country_code) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.paymentsService.validateAndCreateReference({
                            username: username,
                            account_number: account_number,
                            email: email,
                            amount: Number(amount),
                            currency_code: currency_code,
                            country_code: country_code,
                        })];
                });
            });
        };
        /* @Post('initialize')
        async initialize(@Body() dto: InitPaymentDto, @Res() res: Response) {
          try {
            const resp = await this.paymentsService.initializeWithValidation(dto as any);
            if (resp && resp.status && resp.data && resp.data.authorization_url) {
              // Redirect user to checkout
              return res.redirect(resp.data.authorization_url);
            }
            return res.status(502).json({ status: false, message: 'Paystack initialization failed', raw: resp });
          } catch (err) {
            const status = err.status || HttpStatus.BAD_GATEWAY;
            const message = err.message || 'Paystack initialize failed';
            return res.status(status).json({ status: false, message });
          }
        } */
        PaymentsController_1.prototype.performTransaction = function (reference, callback_url, res) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.paymentsService.performTransaction(reference, callback_url)];
                        case 1:
                            result = _a.sent();
                            if (result.checkout_url) {
                                return [2 /*return*/, res.redirect(result.checkout_url)];
                            }
                            return [2 /*return*/, res.status(400).json(result)];
                    }
                });
            });
        };
        PaymentsController_1.prototype.verify = function (reference) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.handleVerifyResponse(reference)];
                });
            });
        };
        // Paystack may redirect with query params like ?trxref=...&reference=...
        PaymentsController_1.prototype.verifyQuery = function (reference, trxref) {
            return __awaiter(this, void 0, void 0, function () {
                var ref;
                return __generator(this, function (_a) {
                    ref = reference || trxref;
                    if (!ref) {
                        throw new common_1.HttpException('Reference missing', common_1.HttpStatus.BAD_REQUEST);
                    }
                    return [2 /*return*/, this.handleVerifyResponse(ref)];
                });
            });
        };
        PaymentsController_1.prototype.handleVerifyResponse = function (reference) {
            return __awaiter(this, void 0, void 0, function () {
                var resp, statusStr, email, amount, currency, account_number, username, rows, clientRows, e_1, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            return [4 /*yield*/, this.paymentsService.verifyAndPersist(reference)];
                        case 1:
                            resp = _a.sent();
                            statusStr = resp && resp.data && resp.data.status === 'success' ? 'successful' : 'failed';
                            email = resp && resp.data && resp.data.customer ? resp.data.customer.email : null;
                            amount = resp && resp.data ? resp.data.amount : null;
                            currency = resp && resp.data ? resp.data.currency : null;
                            account_number = null;
                            username = null;
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, this.paymentsService.dataSource.query("SELECT account_number FROM initialized_transactions WHERE reference = ? LIMIT 1", [reference])];
                        case 3:
                            rows = _a.sent();
                            if (rows && rows.length)
                                account_number = rows[0].account_number;
                            if (!account_number) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.paymentsService.dataSource.query("SELECT username FROM clients WHERE account_number = ? LIMIT 1", [account_number])];
                        case 4:
                            clientRows = _a.sent();
                            if (clientRows && clientRows.length)
                                username = clientRows[0].username;
                            _a.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            e_1 = _a.sent();
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/, {
                                status: statusStr,
                                account_number: account_number,
                                username: username,
                                email: email,
                                amount: amount,
                                currency: currency,
                                raw: resp,
                            }];
                        case 8:
                            err_1 = _a.sent();
                            throw new common_1.HttpException('Paystack verify failed', common_1.HttpStatus.BAD_GATEWAY);
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        return PaymentsController_1;
    }());
    __setFunctionName(_classThis, "PaymentsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _validateUser_decorators = [(0, common_1.Post)('validate_user')];
        _validateUserGet_decorators = [(0, common_1.Get)('validate_user')];
        _performTransaction_decorators = [(0, common_1.Post)('perform_transaction')];
        _verify_decorators = [(0, common_1.Get)('verify/:reference')];
        _verifyQuery_decorators = [(0, common_1.Get)('verify')];
        __esDecorate(_classThis, null, _validateUser_decorators, { kind: "method", name: "validateUser", static: false, private: false, access: { has: function (obj) { return "validateUser" in obj; }, get: function (obj) { return obj.validateUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _validateUserGet_decorators, { kind: "method", name: "validateUserGet", static: false, private: false, access: { has: function (obj) { return "validateUserGet" in obj; }, get: function (obj) { return obj.validateUserGet; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _performTransaction_decorators, { kind: "method", name: "performTransaction", static: false, private: false, access: { has: function (obj) { return "performTransaction" in obj; }, get: function (obj) { return obj.performTransaction; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verify_decorators, { kind: "method", name: "verify", static: false, private: false, access: { has: function (obj) { return "verify" in obj; }, get: function (obj) { return obj.verify; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyQuery_decorators, { kind: "method", name: "verifyQuery", static: false, private: false, access: { has: function (obj) { return "verifyQuery" in obj; }, get: function (obj) { return obj.verifyQuery; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsController = _classThis;
}();
exports.PaymentsController = PaymentsController;
